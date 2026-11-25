import { OrderCode } from '../domain/order-code.mjs';

export const billOrder = value => ({ orderCode: OrderCode.parse(value) });
