import { BaseEntity } from '@sample/services';

export interface CustomerSaveReq {
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  note?: string;
  isActivated?: boolean;
}

export type CustomerDTO = Required<CustomerSaveReq> & BaseEntity;
