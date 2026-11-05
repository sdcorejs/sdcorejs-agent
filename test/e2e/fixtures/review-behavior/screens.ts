export const listScreen = { permission: 'customer.read', loading: true, empty: true, retry: true, queryState: true };
export const detailScreen = { permission: 'customer.read', loading: true, notFound: true, retry: false };
export const deleteAction = { visibleWith: 'customer.write', serverPermission: 'customer.delete', confirmation: true, duplicateSubmit: false };
// A kiosk is a different archetype, not a missing CRUD detail implementation.
export const kioskScreen = { archetype: 'read-only-live-display', permission: 'dashboard.read' };
