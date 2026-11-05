import { createServer } from 'node:http';
// Identities are synthetic. Never use this header-based identity fixture in an application.
export async function startProtectionServer({ enforce = true } = {}) {
  const server = createServer((req, res) => {
    const identity = req.headers['x-fixture-identity'];
    const users = { alice: { tenant: 'a', owner: true, write: true }, bob: { tenant: 'a', owner: false, write: true }, eve: { tenant: 'b', owner: true, write: true }, reader: { tenant: 'a', owner: true, write: false } };
    const user = users[identity];
    let status = 200;
    if (enforce) {
      if (!user) status = 401;
      else if (user.tenant !== 'a' || !user.owner || (req.method !== 'GET' && !user.write)) status = 403;
    }
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(status === 200 ? { id: 1, tenant: 'a' } : { error: 'denied' }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}/customers/1`, close: () => new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); }) };
}
