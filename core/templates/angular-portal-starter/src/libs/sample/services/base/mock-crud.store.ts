import { v4 as uuidv4 } from 'uuid';

import { SdFilter, SdPagingReq, SdPagingRes } from '@sd-angular/core/utilities';

import { BaseEntity } from './base.model';

/**
 * LocalStorage-backed mock CRUD store for starter mode.
 * Keeps data in one entity-specific source file for easy replacement.
 */
export class MockCrudStore<TDto extends BaseEntity, TSaveReq extends object> {
  readonly #storageKey: string;

  constructor(
    entity: string,
    private readonly seedFactory: () => TDto[],
    private readonly mergeSaveReq: (existing: TDto | null, req: TSaveReq) => TDto
  ) {
    this.#storageKey = `sample-mock-${entity}`;
  }

  #ensureSeeded = () => {
    const existingRaw = localStorage.getItem(this.#storageKey);
    if (existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw) as TDto[];
        if (Array.isArray(parsed) && parsed.length > 0) return;
      } catch {
        // Fall through to reseed when corrupted JSON exists.
      }
    }

    const seeds = this.seedFactory();
    localStorage.setItem(this.#storageKey, JSON.stringify(seeds));
  };

  #readAll = (): TDto[] => {
    this.#ensureSeeded();

    try {
      const raw = localStorage.getItem(this.#storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as TDto[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  #writeAll = (items: TDto[]) => {
    localStorage.setItem(this.#storageKey, JSON.stringify(items));
  };

  #containsText = (value: unknown, term: string): boolean => {
    if (value == null) return false;
    return String(value).toLowerCase().includes(term);
  };

  paging = async (req: SdPagingReq<TDto>): Promise<SdPagingRes<TDto>> => {
    const rows = this.#readAll();
    const anyReq = (req ?? {}) as Record<string, unknown>;

    let filtered = [...rows];
    const searchText = String(anyReq['searchText'] ?? anyReq['keyword'] ?? '').trim().toLowerCase();
    if (searchText) {
      filtered = filtered.filter(
        row => this.#containsText((row as Record<string, unknown>)['code'], searchText) || this.#containsText((row as Record<string, unknown>)['name'], searchText)
      );
    }

    const pageSize = Number(anyReq['pageSize'] ?? anyReq['size'] ?? 20);
    const rawPageIndex = Number(anyReq['pageIndex'] ?? anyReq['page'] ?? 0);
    const pageIndex = Number.isFinite(rawPageIndex) && rawPageIndex > 0 && !('pageIndex' in anyReq) ? rawPageIndex - 1 : rawPageIndex;
    const safePageIndex = Number.isFinite(pageIndex) && pageIndex >= 0 ? pageIndex : 0;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;

    const start = safePageIndex * safePageSize;
    const items = filtered.slice(start, start + safePageSize);

    return {
      items,
      total: filtered.length,
    } as SdPagingRes<TDto>;
  };

  search = async (term: string, _filters?: SdFilter<TDto>[]): Promise<TDto[]> => {
    const rows = this.#readAll();
    const keyword = (term ?? '').trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter(
      row => this.#containsText((row as Record<string, unknown>)['code'], keyword) || this.#containsText((row as Record<string, unknown>)['name'], keyword)
    );
  };

  all = async (): Promise<TDto[]> => {
    return this.#readAll();
  };

  detail = async (id: string): Promise<TDto> => {
    const entity = this.#readAll().find(e => e.id === id);
    if (!entity) throw new Error(`Entity not found: ${id}`);
    return entity;
  };

  create = async (req: TSaveReq): Promise<TDto> => {
    const now = new Date().toISOString();
    const entity = this.mergeSaveReq(null, req);
    entity.id = uuidv4();
    entity.createdAt = now;
    entity.updatedAt = now;
    entity.createdBy = 'mock-user';
    entity.updatedBy = 'mock-user';

    const rows = this.#readAll();
    rows.unshift(entity);
    this.#writeAll(rows);
    return entity;
  };

  update = async (id: string, req: TSaveReq): Promise<TDto> => {
    const rows = this.#readAll();
    const index = rows.findIndex(e => e.id === id);
    if (index < 0) throw new Error(`Entity not found: ${id}`);

    const existing = rows[index];
    const updated = this.mergeSaveReq(existing, req);
    updated.id = existing.id;
    updated.createdAt = existing.createdAt;
    updated.createdBy = existing.createdBy;
    updated.updatedAt = new Date().toISOString();
    updated.updatedBy = 'mock-user';

    rows[index] = updated;
    this.#writeAll(rows);
    return updated;
  };

  remove = async (id: string | string[]): Promise<void> => {
    const ids = Array.isArray(id) ? id : [id];
    const remain = this.#readAll().filter(entity => !ids.includes(entity.id));
    this.#writeAll(remain);
  };
}
