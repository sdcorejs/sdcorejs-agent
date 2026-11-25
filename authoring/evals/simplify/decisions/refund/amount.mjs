// Amounts are integer cents; paid is nonnegative.
export function refundCents(paid, requested) {
  if (requested <= 0) return 0;
  if (requested > paid) return paid;
  return requested;
}
