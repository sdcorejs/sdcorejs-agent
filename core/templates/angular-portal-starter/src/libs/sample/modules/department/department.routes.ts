import { Routes } from '@angular/router';

import { DepartmentService } from './services/department.service';

export const departmentRoutes: Routes = [
  {
    path: '',
    providers: [DepartmentService],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
        data: { permission: 'SAMPLE_C_DEPARTMENT_LIST', permissionKey: 'sample' },
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_DEPARTMENT_CREATE', permissionKey: 'sample' },
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_DEPARTMENT_DETAIL', permissionKey: 'sample' },
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: { permission: 'SAMPLE_C_DEPARTMENT_UPDATE', permissionKey: 'sample' },
      },
    ],
  },
];
