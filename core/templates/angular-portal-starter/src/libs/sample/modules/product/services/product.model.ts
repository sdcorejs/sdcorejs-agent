import { BaseEntity } from '@sample/services';

export interface ProductSaveReq {
  code?: string;
  name?: string;
  price?: number;
  isActivated?: boolean;
  note?: string;
}

export type ProductDTO = Required<ProductSaveReq> & BaseEntity;
