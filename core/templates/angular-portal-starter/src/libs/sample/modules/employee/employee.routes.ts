import { Routes } from '@angular/router';
import { EmployeeService } from './services/employee.service';

export const employeeRoutes: Routes = [
  {
    path: '',
    providers: [EmployeeService],
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
