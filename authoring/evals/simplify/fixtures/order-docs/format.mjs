export function formatTicket(identifier) {
  const value = String(identifier).trim().toUpperCase();
  if (!/^TK-\d{3}$/.test(value)) throw new TypeError('Invalid ticket identifier');
  return value;
}
