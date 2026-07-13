import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestActor, requireActor } from './request-actor';

export const TOKEN_VERIFIER = Symbol('TOKEN_VERIFIER');

export interface TokenVerifier {
  verify(token: string): Promise<RequestActor>;
}
@Injectable()
export class DenyAllTokenVerifier implements TokenVerifier {
  async verify(): Promise<RequestActor> {
    throw new UnauthorizedException('No production token verifier is configured.');
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
