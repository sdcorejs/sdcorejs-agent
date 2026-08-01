import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import {
  exportJWK,
  generateKeyPair,
  JWK,
  KeyLike,
  SignJWT,
} from 'jose';
import { RequestActor } from '../../src/auth/request-actor';

interface SigningKey {
  kid: string;
  privateKey: KeyLike;
  publicJwk: JWK;
}

export interface TokenOptions {
  issuer?: string;
  audience?: string | string[];
  expiresAt?: number;
  issuedAt?: number;
  notBefore?: number;
  algorithm?: 'RS256' | 'PS256';
  kid?: string;
  signingKey?: KeyLike;
}

export interface OidcFixture {
  issuer: string;
  audience: string;
  jwksUri: string;
  issue(actor: RequestActor, options?: TokenOptions): Promise<string>;
  issueWrongSignature(actor: RequestActor): Promise<string>;
  issueUnknownKid(actor: RequestActor): Promise<string>;
  issueUnsupportedAlgorithm(actor: RequestActor): Promise<string>;
  rotate(): Promise<void>;
  close(): Promise<void>;
}

async function createSigningKey(kid: string): Promise<SigningKey> {
  const { privateKey, publicKey } = await generateKeyPair('RS256', {
    modulusLength: 2048,
  });
  return {
    kid,
    privateKey,
    publicJwk: {
      ...(await exportJWK(publicKey)),
      kid,
      alg: 'RS256',
      use: 'sig',
    },
  };
}

function listen(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

export async function createOidcFixture(): Promise<OidcFixture> {
  let active = await createSigningKey('key-1');
  const attacker = await createSigningKey('attacker');
  const server = createServer((request, response) => {
    if (request.url !== '/jwks') {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': 'application/json',
    });
    response.end(JSON.stringify({ keys: [active.publicJwk] }));
  });
  await listen(server);
  const address = server.address() as AddressInfo;
  const issuer = `http://127.0.0.1:${address.port}`;
  const audience = 'sdcorejs-golden-api';

  const issue = async (
    actor: RequestActor,
    options: TokenOptions = {},
  ): Promise<string> => {
    const now = Math.floor(Date.now() / 1000);
    const algorithm = options.algorithm ?? 'RS256';
    let token = new SignJWT({
      permissions: [...actor.permissions],
      ...(actor.tenantCode ? { tenant_code: actor.tenantCode } : {}),
      ...(actor.departmentCode ? { department_code: actor.departmentCode } : {}),
    })
      .setProtectedHeader({
        alg: algorithm,
        kid: options.kid ?? active.kid,
      })
      .setSubject(actor.id)
      .setIssuer(options.issuer ?? issuer)
      .setAudience(options.audience ?? audience)
      .setIssuedAt(options.issuedAt ?? now)
      .setExpirationTime(options.expiresAt ?? now + 300);
    if (options.notBefore !== undefined) token = token.setNotBefore(options.notBefore);
    return token.sign(options.signingKey ?? active.privateKey);
  };

  return {
    issuer,
    audience,
    jwksUri: `${issuer}/jwks`,
    issue,
    issueWrongSignature: (actor) =>
      issue(actor, { signingKey: attacker.privateKey, kid: active.kid }),
    issueUnknownKid: (actor) => issue(actor, { kid: 'unknown-kid' }),
    issueUnsupportedAlgorithm: (actor) =>
      issue(actor, { algorithm: 'PS256' }),
    async rotate() {
      active = await createSigningKey(`key-${Date.now()}`);
    },
    close: () => close(server),
  };
}
