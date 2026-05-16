import { SdFilter, SdPagingReq, SdPagingRes, SdQueryReq } from '@sd-angular/core/utilities';

// ===========================================================================
// --- BASE ENTITY ---
// ===========================================================================
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// ===========================================================================
// --- BASE REGISTER OPTIONS ---
// ===========================================================================
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RegisterOption {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IBaseRegister<TDto = any, TSaveReq = TDto> {
  host: string;
  baseUrl: string;
  paging: (req: SdPagingReq<TDto>, option?: RegisterOption) => Promise<SdPagingRes<TDto>>;
  search: (term: string, filters?: SdFilter<TDto>[]) => Promise<TDto[]>;
  all: (req?: SdQueryReq<TDto>, option?: RegisterOption) => Promise<TDto[]>;
  detail: (id: string) => Promise<TDto>;
  create: (req: TSaveReq) => Promise<TDto>;
  update: (id: string, req: TSaveReq) => Promise<TDto>;
  remove: (id: string | string[]) => Promise<void>;
}
