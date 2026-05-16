import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const sampleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  // Thêm logic guard tại đây
  return true;
};
