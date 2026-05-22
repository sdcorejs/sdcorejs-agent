import { Routes } from '@angular/router';

import { EmployeeService } from './services/employee.service';

// UnifiedCompact detail page pattern: same component handles CREATE / UPDATE / DETAIL states.
export const employeeRoutes: Routes = [
  {
    path: '',
    providers: [EmployeeService],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
        data: { permission: 'SAMPLE_C_EMPLOYEE_LIST', permissionKey: 'sample' },
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_EMPLOYEE_CREATE', permissionKey: 'sample' },
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_EMPLOYEE_DETAIL', permissionKey: 'sample' },
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_EMPLOYEE_UPDATE', permissionKey: 'sample' },
      },
    ],
  },
];
