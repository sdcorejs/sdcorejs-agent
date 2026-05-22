import { employeeRoutes } from './employee.routes';

describe('employeeRoutes', () => {
  it('should define all required routes with permission data', () => {
    const children = employeeRoutes[0].children ?? [];
    expect(children.length).toBe(4);
    children.forEach(r => {
      expect(r.data?.['permission']).toBeTruthy();
      expect(r.data?.['permissionKey']).toBe('sample');
      expect(r.data?.['permission']).toMatch(/^SAMPLE_C_EMPLOYEE_/);
    });
  });
});
