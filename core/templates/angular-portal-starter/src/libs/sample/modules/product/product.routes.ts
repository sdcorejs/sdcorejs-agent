import { Routes } from '@angular/router';

import { ProductService } from './services/product.service';

// Side-drawer pattern: all CRUD happens inline inside the list page drawer.
// No sub-routes for create/detail/update.
export const productRoutes: Routes = [
  {
    path: '',
    providers: [ProductService],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
        data: { permission: 'SAMPLE_C_PRODUCT_LIST', permissionKey: 'sample' },
      },
    ],
  },
];
