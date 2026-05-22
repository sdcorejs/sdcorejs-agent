import { Routes } from '@angular/router';

import { SaleEventService } from './services/sale-event.service';

export const saleEventRoutes: Routes = [
  {
    path: '',
    providers: [SaleEventService],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
        data: { permission: 'SAMPLE_C_SALE_EVENT_LIST', permissionKey: 'sample' },
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_SALE_EVENT_CREATE', permissionKey: 'sample' },
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_SALE_EVENT_DETAIL', permissionKey: 'sample' },
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_SALE_EVENT_UPDATE', permissionKey: 'sample' },
      },
    ],
  },
];
