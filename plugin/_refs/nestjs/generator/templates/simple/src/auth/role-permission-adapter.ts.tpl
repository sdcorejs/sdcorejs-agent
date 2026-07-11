import { Injectable } from '@nestjs/common';
import { RequestActor } from './request-actor';

@Injectable()
export class RolePermissionAdapter {
  has(actor: RequestActor, permission: string): boolean {
    return actor.permissions.includes(permission);
  }
}
