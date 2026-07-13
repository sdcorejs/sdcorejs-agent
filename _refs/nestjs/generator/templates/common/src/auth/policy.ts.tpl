import { applyDecorators, CanActivate, ExecutionContext, Injectable, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticationGuard } from './authentication';
import { RequestActor, requireActor } from './request-actor';

export const PROTECTED_ROUTE = 'sdcorejs:protected';
export const PERMISSION = 'sdcorejs:permission';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const target = context.getHandler();
    const protectedRoute = this.reflector.get<boolean>(PROTECTED_ROUTE, target);
    if (!protectedRoute) return true;
    const permission = this.reflector.get<string>(PERMISSION, target);
    if (!permission) return false;
    let actor: RequestActor;
    try {
      actor = requireActor(context.switchToHttp().getRequest<{ user?: unknown }>().user);
    } catch {
      return false;
    }
    return actor.permissions.includes(permission);
  }
}

export function Protected(permission: string): MethodDecorator {
  return applyDecorators(
    SetMetadata(PROTECTED_ROUTE, true),
    SetMetadata(PERMISSION, permission),
    UseGuards(AuthenticationGuard, PolicyGuard),
  );
}
