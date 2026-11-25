import { Reader } from './reader.mjs';
export class CountReader extends Reader {
  async decode(connection) { return Number(await connection.text()); }
}
