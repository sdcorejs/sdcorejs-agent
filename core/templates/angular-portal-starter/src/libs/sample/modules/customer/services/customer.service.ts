import { Injectable } from '@angular/core';
import { MockCrudStore } from '@sample/services';

import { CUSTOMER_SEED_DATA } from './customer.mock-data';
import { CustomerDTO, CustomerSaveReq } from './customer.model';

@Injectable()
export class CustomerService {
  readonly #store = new MockCrudStore<CustomerDTO, CustomerSaveReq>(
    'customer',
    () => [...CUSTOMER_SEED_DATA],
    (existing, req) => ({
      ...(existing ?? ({} as CustomerDTO)),
      code: String(req.code ?? existing?.code ?? ''),
      name: String(req.name ?? existing?.name ?? ''),
      email: String(req.email ?? existing?.email ?? ''),
      phone: String(req.phone ?? existing?.phone ?? ''),
      address: String(req.address ?? existing?.address ?? ''),
      note: String(req.note ?? existing?.note ?? ''),
      isActivated: Boolean(req.isActivated ?? existing?.isActivated ?? true),
    })
  );

  paging = this.#store.paging;
  search = this.#store.search;
  all = this.#store.all;
  detail = this.#store.detail;
  create = this.#store.create;
  update = this.#store.update;
  remove = this.#store.remove;
}
