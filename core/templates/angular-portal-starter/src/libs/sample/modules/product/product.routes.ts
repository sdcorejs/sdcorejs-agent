import { Routes } from '@angular/router';
import { ProductService } from './services/product.service';

export const productRoutes: Routes = [
  {
    path: '',
    providers: [ProductService],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
      },
    ],
  },
];
