import { inject, Injectable } from '@angular/core';
import { ISdLayoutConfiguration, SdAuthService } from '@sd-angular/core/modules';

@Injectable()
export class LayoutConfiguration implements ISdLayoutConfiguration {
  #authService = inject(SdAuthService);

  userInfo: ISdLayoutConfiguration['userInfo'] = () => ({
    username: 'demo-user',
    email: 'demo@example.com',
    fullName: 'Demo User',
  });

  signout = () => this.#authService.signout();
  changePassword = () => this.#authService.changePassword();

  sidebar = {
    version: 1 as any,
    logoUrl: 'logo.png',
    defaultTitle: 'Angular Portal Starter',
  };
}
