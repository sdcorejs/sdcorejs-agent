import { saleEventRoutes } from './sale-event.routes';

describe('saleEventRoutes', () => {
  it('should define route permission metadata', () => {
    const children = saleEventRoutes[0].children ?? [];
    expect(children.length).toBe(4);

    children.forEach(route => {
      expect(route.data?.['permission']).toMatch(/^SAMPLE_C_SALE_EVENT_/);
      expect(route.data?.['permissionKey']).toBe('sample');
    });
  });
});
