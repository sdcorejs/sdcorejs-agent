import { Routes } from '@angular/router';

import { CustomerService } from './services/customer.service';

export const customerRoutes: Routes = [
  {
    path: '',
    providers: [CustomerService],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
        data: { permission: 'SAMPLE_C_CUSTOMER_LIST', permissionKey: 'sample' },
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_CUSTOMER_CREATE', permissionKey: 'sample' },
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_CUSTOMER_DETAIL', permissionKey: 'sample' },
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_CUSTOMER_UPDATE', permissionKey: 'sample' },
      },
    ],
  },
];
