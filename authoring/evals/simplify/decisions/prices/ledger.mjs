// Ledger ties resolve to an even cent.
export function postedCents(halfCents) {
  const lower = Math.floor(halfCents / 2);
  return halfCents % 2 && lower % 2 ? lower + 1 : lower;
}
