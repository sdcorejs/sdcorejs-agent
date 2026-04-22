import { productRoutes } from './product.routes';

describe('productRoutes', () => {
  it('should define list route with permission data', () => {
    const children = productRoutes[0].children ?? [];
    expect(children.length).toBe(1);
    children.forEach(r => {
      expect(r.data?.['permission']).toBeTruthy();
      expect(r.data?.['permissionKey']).toBe('sample');
      expect(r.data?.['permission']).toMatch(/^SAMPLE_C_PRODUCT_/);
    });
  });
});
