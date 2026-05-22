import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ISdPermissionConfiguration } from '@sd-angular/core/modules';

@Injectable({ providedIn: 'root' })
export class PermissionConfiguration implements ISdPermissionConfiguration {
  #router = inject(Router);

  disabled = true;
  loadPermissions = (): string[] => [];
  onForbiden = () => this.#router.navigate(['layout', 'forbidden']);
}
