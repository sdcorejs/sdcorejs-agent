import { routes } from './employee.routes';

describe('employee.routes', () => {
  it('should define routes', () => {
    expect(routes.length).toBeGreaterThan(0);
  });
});
