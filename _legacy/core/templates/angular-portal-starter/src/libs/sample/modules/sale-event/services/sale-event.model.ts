import { BaseEntity } from '@sample/services';

export interface SaleEventSaveReq {
  code?: string;
  name?: string;
  projectName?: string;
  sellType?: string;
  expectedStartDate?: string;
  expectedEndDate?: string;
  approvalStatus?: string;
  operationStatus?: string;
  inventoryPoolCount?: number;
  description?: string;
  note?: string;
}

export type SaleEventDTO = Required<SaleEventSaveReq> & BaseEntity;
