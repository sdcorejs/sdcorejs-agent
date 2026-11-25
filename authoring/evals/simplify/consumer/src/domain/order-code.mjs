export class OrderCode {
  static parse(value) {
    const code = String(value ?? '').trim().toUpperCase();
    if (!/^SO-[0-9]{3}$/.test(code)) throw new TypeError('Invalid sales order');
    return code;
  }
}
