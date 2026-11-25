import { Reader } from './reader.mjs';
export class TextReader extends Reader {
  decode(connection) { return connection.text(); }
}
