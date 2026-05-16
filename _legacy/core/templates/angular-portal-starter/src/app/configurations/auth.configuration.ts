import { Injectable } from '@angular/core';
import { ISdAuthConfiguration } from '@sd-angular/core/modules';

@Injectable()
export class AuthConfiguration implements ISdAuthConfiguration {
  guard: ISdAuthConfiguration['guard'] = {
    auth: () => true,
    portal: async () => true,
    authInfo: () => ({
      username: 'demo-user',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
    }),
  };

  action: ISdAuthConfiguration['action'] = {
    signout: async () => { /* logout handler */ },
    changePassword: async () => { /* password change handler */ },
  };
}
