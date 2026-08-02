import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { AppEnv, APP_ENV } from '../config/env';
import { RequestActor, requireActor } from './request-actor';

export const TOKEN_VERIFIER = Symbol('TOKEN_VERIFIER');

export interface TokenVerifier {
  verify(token: string): Promise<RequestActor>;
}

@Injectable()
export class OidcTokenVerifier implements TokenVerifier {
  readonly #jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(@Inject(APP_ENV) private readonly env: AppEnv) {
    this.#jwks = createRemoteJWKSet(new URL(env.oidcJwksUri), {
      cooldownDuration: env.oidcJwksCooldownMs,
    });
  }

  async verify(token: string): Promise<RequestActor> {
    const { payload } = await jwtVerify(token, this.#jwks, {
      issuer: this.env.oidcIssuer,
      audience: this.env.oidcAudience,
      algorithms: this.env.oidcAllowedAlgorithms,
      clockTolerance: this.env.oidcClockToleranceSeconds,
      maxTokenAge: this.env.oidcMaxTokenAge,
    });
    return this.#actorFromClaims(payload);
  }

  #actorFromClaims(payload: JWTPayload): RequestActor {
    if (typeof payload.sub !== 'string' || payload.sub.trim() === '') {
      throw new UnauthorizedException('OIDC subject is required.');
    }
    if (typeof payload.exp !== 'number' || typeof payload.iat !== 'number') {
      throw new UnauthorizedException('OIDC token lifetime claims are required.');
    }
    const permissionsValue = payload[this.env.oidcPermissionsClaim];
    if (
      !Array.isArray(permissionsValue) ||
      !permissionsValue.every(
        (permission) => typeof permission === 'string' && permission.trim() !== '',
      )
    ) {
      throw new UnauthorizedException('OIDC permissions claim is invalid.');
    }
    const optionalClaim = (claimName: string): string | undefined => {
      const value = payload[claimName];
      if (value === undefined) return undefined;
      if (typeof value !== 'string' || value.trim() === '') {
        throw new UnauthorizedException(`OIDC ${claimName} claim is invalid.`);
      }
      return value;
    };
    return {
      verified: true,
      id: payload.sub,
      permissions: [...new Set(permissionsValue)],
      tenantCode: optionalClaim(this.env.oidcTenantClaim),
      departmentCode: optionalClaim(this.env.oidcDepartmentClaim),
    };
  }
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(@Inject(TOKEN_VERIFIER) private readonly verifier: TokenVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: RequestActor }>();
    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer ([A-Za-z0-9._~-]+)$/u);
    if (!match) throw new UnauthorizedException('Bearer token is required.');
    try {
      request.user = requireActor(await this.verifier.verify(match[1]!));
      return true;
    } catch {
      throw new UnauthorizedException('Bearer token is invalid.');
    }
  }
}
