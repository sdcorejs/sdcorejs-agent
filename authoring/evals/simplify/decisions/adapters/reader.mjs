export class Reader {
  async read(port) {
    const connection = await port.open();
    try {
      return await this.decode(connection);
    } finally {
      await connection.close();
    }
  }
}
