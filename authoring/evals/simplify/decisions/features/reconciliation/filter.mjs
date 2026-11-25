import { matchesStatus } from '../../shared/status.mjs';

export const includeRow = (row, filter) => matchesStatus(row, filter);
