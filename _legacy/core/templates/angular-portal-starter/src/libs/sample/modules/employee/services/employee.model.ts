// --- ENUMS & CONSTANTS ---
import { BaseEntity } from '@sample/services';

export const EMPLOYEE_ROLES = [
  { value: 'EMPLOYEE', display: 'Nhân viên' },
  { value: 'MANAGER', display: 'Quản lý' },
];

// ===========================================================================
// --- REQUEST MODELS ---
// ===========================================================================
export interface EmployeeSaveReq {
  // UI: sd-input (required, maxlength 16)
  code?: string;
  // UI: sd-input (required)
  name?: string;
  // UI: sd-input-number
  salary?: number;
  // UI: sd-date
  birthday?: string;
  // UI: sd-select (Data tĩnh: EMPLOYEE_ROLES)
  role?: string;
  // UI: sd-select (True/False)
  isActivated?: boolean;
  // UI: sd-textarea
  note?: string;
}

// ===========================================================================
// --- RESPONSE MODELS ---
// ===========================================================================
export type EmployeeDTO = Required<EmployeeSaveReq> & BaseEntity;
