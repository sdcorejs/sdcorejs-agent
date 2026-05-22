import { BaseEntity } from '@sample/services';

// ===========================================================================
// --- REQUEST MODELS ---
// ===========================================================================
export interface DepartmentSaveReq {
  // UI: sd-input (required, maxlength 32)
  code?: string;
  // UI: sd-input (required)
  name?: string;
  // UI: sd-textarea
  description?: string;
  // UI: sd-select (True/False)
  isActivated?: boolean;
}

// ===========================================================================
// --- RESPONSE MODELS ---
// ===========================================================================
export type DepartmentDTO = Required<DepartmentSaveReq> & BaseEntity;
