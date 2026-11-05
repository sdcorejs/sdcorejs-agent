// Synthetic routing contract: identity is supplied by an already authenticated host.
// Customer details are private to their tenant and owner. Public exemption wins
// over global/controller protection; absent method metadata inherits protection.
const globalGuards = [context => Boolean(context.identity)];
const controllerGuards = [context => context.identity.tenant === context.customer.tenant,
  context => context.identity.id === context.customer.ownerId];
const routes = {
  inheritedDetail: { handler: context => context.customer },
  exemptedDetail: { public: true, handler: context => context.customer },
};
export function dispatchDetail(routeName, context) {
  const route = routes[routeName];
  if (!route) return { status: 404 };
  if (route.public !== true && ![...globalGuards, ...controllerGuards].every(guard => guard(context))) return { status: 403 };
  return { status: 200, body: route.handler(context) };
}
export const inheritedDetail = context => dispatchDetail('inheritedDetail', context);
export const exemptedDetail = context => dispatchDetail('exemptedDetail', context);
