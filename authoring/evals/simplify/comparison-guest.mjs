// This process runs inside Bubblewrap, in a network namespace with only loopback.
// Its only upstream is the mounted experiment socket.
import net from 'node:net';
import { spawn } from 'node:child_process';

const relay = net.createServer(client => {
  const peer = net.connect('/runner/model.sock');
  client.on('error', () => peer.destroy());
  peer.on('error', () => client.destroy());
  client.pipe(peer).pipe(client);
});
relay.listen(18080, '127.0.0.1', () => {
  const agent = spawn('/runner/opencode', ['run', '--format', 'json', '--model', process.argv[2], process.argv[3]], { stdio: 'inherit' });
  agent.on('error', error => { console.error(error.message); process.exit(1); });
  agent.on('exit', (code, signal) => process.exit(signal ? 1 : code ?? 1));
});
