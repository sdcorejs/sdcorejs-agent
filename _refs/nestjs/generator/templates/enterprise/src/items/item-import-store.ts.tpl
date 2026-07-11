import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { AppError } from '../errors/app-error';
import type { ImportResult } from './item-import';

export interface ImportOperationIdentity {
  tenantCode: string;
  departmentCode?: string;
  operationKey: string;
  requestDigest: string;
}

type ImportWork = () => Promise<readonly ImportResult[]> | readonly ImportResult[];

interface StoredOperation {
  requestDigest: string;
  result: readonly ImportResult[];
}

function operationScopeKey(identity: ImportOperationIdentity): string {
  return JSON.stringify([
    identity.tenantCode,
    identity.departmentCode ?? null,
    identity.operationKey,
  ]);
}

function operationFileKey(identity: ImportOperationIdentity): string {
  return createHash('sha256').update(operationScopeKey(identity)).digest('hex');
}

function cloneResult(result: readonly ImportResult[]): readonly ImportResult[] {
  return result.map((row) => ({ ...row }));
}

function replay(record: StoredOperation, identity: ImportOperationIdentity): readonly ImportResult[] {
  if (record.requestDigest !== identity.requestDigest) {
    throw new AppError('import.idempotency-conflict');
  }
  return cloneResult(record.result);
}

export abstract class ImportOperationStore {
  abstract executeOnce(identity: ImportOperationIdentity, work: ImportWork): Promise<readonly ImportResult[]>;
}

export const IMPORT_OPERATION_DIRECTORY = Symbol('IMPORT_OPERATION_DIRECTORY');

@Injectable()
export class InMemoryImportOperationStore extends ImportOperationStore {
  private readonly operations = new Map<string, StoredOperation>();
  private readonly active = new Map<string, { requestDigest: string; promise: Promise<readonly ImportResult[]> }>();
  executions = 0;

  async executeOnce(identity: ImportOperationIdentity, work: ImportWork): Promise<readonly ImportResult[]> {
    const key = operationScopeKey(identity);
    const stored = this.operations.get(key);
    if (stored) return replay(stored, identity);
    const active = this.active.get(key);
    if (active) {
      if (active.requestDigest !== identity.requestDigest) throw new AppError('import.idempotency-conflict');
      return cloneResult(await active.promise);
    }
    this.executions += 1;
    const promise = Promise.resolve().then(work).then(cloneResult);
    this.active.set(key, { requestDigest: identity.requestDigest, promise });
    try {
      const result = await promise;
      this.operations.set(key, { requestDigest: identity.requestDigest, result: cloneResult(result) });
      return cloneResult(result);
    } finally {
      this.active.delete(key);
    }
  }
}

@Injectable()
export class FileImportOperationStore extends ImportOperationStore {
  private readonly active = new Map<string, { requestDigest: string; promise: Promise<readonly ImportResult[]> }>();
  private readonly directory: string;

  constructor(
    @Optional() @Inject(IMPORT_OPERATION_DIRECTORY) directory?: string,
  ) {
    super();
    this.directory = directory ?? process.env.IMPORT_OPERATION_DIR ?? path.resolve('.data/import-operations');
  }

  async executeOnce(identity: ImportOperationIdentity, work: ImportWork): Promise<readonly ImportResult[]> {
    const key = operationFileKey(identity);
    const active = this.active.get(key);
    if (active) {
      if (active.requestDigest !== identity.requestDigest) throw new AppError('import.idempotency-conflict');
      return cloneResult(await active.promise);
    }
    const promise = this.executeWithFileLock(key, identity, work);
    this.active.set(key, { requestDigest: identity.requestDigest, promise });
    try {
      return cloneResult(await promise);
    } finally {
      this.active.delete(key);
    }
  }

  private async executeWithFileLock(
    key: string,
    identity: ImportOperationIdentity,
    work: ImportWork,
  ): Promise<readonly ImportResult[]> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const recordPath = path.join(this.directory, `${key}.json`);
    const existing = await this.readRecord(recordPath);
    if (existing) return replay(existing, identity);
    const lockPath = path.join(this.directory, `${key}.lock`);
    let lock: Awaited<ReturnType<typeof open>>;
    try {
      lock = await open(lockPath, 'wx', 0o600);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      return this.waitForReplay(recordPath, identity);
    }
    try {
      const raced = await this.readRecord(recordPath);
      if (raced) return replay(raced, identity);
      const result = cloneResult(await work());
      const temporary = `${recordPath}.${process.pid}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, JSON.stringify({ requestDigest: identity.requestDigest, result }), {
          encoding: 'utf8',
          flag: 'wx',
          mode: 0o600,
        });
        await rename(temporary, recordPath);
      } finally {
        await rm(temporary, { force: true });
      }
      return cloneResult(result);
    } finally {
      await lock.close();
      await rm(lockPath, { force: true });
    }
  }

  private async waitForReplay(
    recordPath: string,
    identity: ImportOperationIdentity,
  ): Promise<readonly ImportResult[]> {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const record = await this.readRecord(recordPath);
      if (record) return replay(record, identity);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    throw new AppError('import.operation-in-progress');
  }

  private async readRecord(recordPath: string): Promise<StoredOperation | undefined> {
    try {
      const parsed = JSON.parse(await readFile(recordPath, 'utf8')) as Partial<StoredOperation>;
      if (typeof parsed.requestDigest !== 'string' || !Array.isArray(parsed.result)) {
        throw new AppError('import.operation-state-invalid');
      }
      return { requestDigest: parsed.requestDigest, result: cloneResult(parsed.result) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
      throw error;
    }
  }
}
