import { routes } from './product.routes';

describe('product.routes', () => {
  it('should define routes', () => {
    expect(routes.length).toBeGreaterThan(0);
  });
});
