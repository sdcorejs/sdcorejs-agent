/**
 * Minimal RFC 6455 client for Visual Companion tests.
 *
 * Written against Node built-ins so the test suite needs no WebSocket
 * dependency. It handles the frame shapes the server actually emits, including
 * extended 16-bit lengths and several frames arriving in one TCP chunk.
 */

import { randomBytes } from 'node:crypto';
import net from 'node:net';

function decodeServerFrames(buffer) {
  const messages = [];
  let cursor = buffer;
  for (;;) {
    if (cursor.length < 2) break;
    const opcode = cursor[0] & 0x0f;
    const masked = (cursor[1] & 0x80) !== 0;
    let length = cursor[1] & 0x7f;
    let offset = 2;
    if (length === 126) {
      if (cursor.length < 4) break;
      length = cursor.readUInt16BE(2);
      offset = 4;
    } else if (length === 127) {
      if (cursor.length < 10) break;
      length = Number(cursor.readBigUInt64BE(2));
      offset = 10;
    }
    if (masked) offset += 4;
    if (cursor.length < offset + length) break;
    const payload = cursor.subarray(offset, offset + length);
    cursor = cursor.subarray(offset + length);
    if (opcode === 0x01) {
      try {
        messages.push(JSON.parse(payload.toString('utf8')));
      } catch {
        messages.push({ type: 'unparsed', raw: payload.toString('utf8') });
      }
    } else if (opcode === 0x08) {
      messages.push({ type: 'close' });
    }
  }
  return { messages, rest: cursor };
}

function encodeClientFrame(value) {
  const payload = Buffer.from(JSON.stringify(value), 'utf8');
  const mask = randomBytes(4);
  const masked = Buffer.alloc(payload.length);
  for (let index = 0; index < payload.length; index += 1) {
    masked[index] = payload[index] ^ mask[index % 4];
  }
  let header;
  if (payload.length < 126) {
    header = Buffer.from([0x81, 0x80 | payload.length]);
  } else {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  }
  return Buffer.concat([header, mask, masked]);
}

/**
 * Connect an authenticated companion event-channel client.
 *
 * `origin` defaults to the correct same-origin value; pass an explicit value
 * (or `null` to omit the header) to exercise the origin gate.
 */
export function connectCompanionClient({ port, token, origin, omitOrigin = false, host = '127.0.0.1' } = {}) {
  return new Promise((resolve, reject) => {
    const messages = [];
    const key = randomBytes(16).toString('base64');
    const socket = net.connect(port, host, () => {
      const originHeader = omitOrigin
        ? ''
        : `Origin: ${origin ?? `http://${host}:${port}`}\r\n`;
      const query = token === undefined ? '' : `?key=${token}`;
      socket.write(
        `GET /${query} HTTP/1.1\r\n` +
          `Host: ${host}:${port}\r\n` +
          'Upgrade: websocket\r\nConnection: Upgrade\r\n' +
          `Sec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n` +
          `${originHeader}\r\n`,
      );
    });

    let buffer = Buffer.alloc(0);
    let upgraded = false;
    let settled = false;

    const client = {
      socket,
      messages,
      send(value) {
        socket.write(encodeClientFrame(value));
      },
      /** Resolve once a message satisfying `predicate` arrives, else time out. */
      waitFor(predicate, timeoutMs = 2000) {
        return new Promise((resolveWait, rejectWait) => {
          const existing = messages.find(predicate);
          if (existing) {
            resolveWait(existing);
            return;
          }
          const started = Date.now();
          const poll = setInterval(() => {
            const found = messages.find(predicate);
            if (found) {
              clearInterval(poll);
              resolveWait(found);
            } else if (Date.now() - started > timeoutMs) {
              clearInterval(poll);
              rejectWait(new Error('timed out waiting for a companion message'));
            }
          }, 10);
        });
      },
      close() {
        try {
          socket.destroy();
        } catch {
          // already closed
        }
      },
    };

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (!upgraded) {
        const end = buffer.indexOf('\r\n\r\n');
        if (end < 0) return;
        const head = buffer.subarray(0, end).toString('utf8');
        upgraded = head.includes(' 101 ');
        buffer = buffer.subarray(end + 4);
        if (!settled) {
          settled = true;
          if (!upgraded) {
            socket.destroy();
            reject(new Error(`upgrade refused: ${head.split('\r\n')[0]}`));
            return;
          }
          resolve(client);
        }
      }
      const decoded = decodeServerFrames(buffer);
      buffer = decoded.rest;
      messages.push(...decoded.messages);
    });

    socket.on('error', (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    socket.on('close', () => {
      if (!settled) {
        settled = true;
        reject(new Error('connection closed before upgrade'));
      }
    });
  });
}

export { decodeServerFrames, encodeClientFrame };
