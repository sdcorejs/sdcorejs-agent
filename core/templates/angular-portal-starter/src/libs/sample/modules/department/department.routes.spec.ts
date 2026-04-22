import { Routes } from '@angular/router';

import { DepartmentService } from './services/department.service';

describe('departmentRoutes', () => {
  it('should define all required routes', () => {
    const routes: Routes = [
      {
        path: '',
        providers: [DepartmentService],
        children: [
          { path: '', data: { permission: 'SAMPLE_C_DEPARTMENT_LIST', permissionKey: 'sample' } },
          { path: 'create', data: { permission: 'SAMPLE_C_DEPARTMENT_CREATE', permissionKey: 'sample' } },
          { path: 'detail/:id', data: { permission: 'SAMPLE_C_DEPARTMENT_DETAIL', permissionKey: 'sample' } },
          { path: 'update/:id', data: { permission: 'SAMPLE_C_DEPARTMENT_UPDATE', permissionKey: 'sample' } },
        ],
      },
    ];

    const children = routes[0].children ?? [];

    children.forEach(r => {
      expect(r.data?.['permission']).toBeTruthy();
      expect(r.data?.['permissionKey']).toBe('sample');
      expect(r.data?.['permission']).toMatch(/^SAMPLE_C_DEPARTMENT_/);
    });
  });
});
