// Convert nonnegative half-cents to the nearest whole cent for display.
export const displayedCents = halfCents => Math.round(halfCents / 2);
