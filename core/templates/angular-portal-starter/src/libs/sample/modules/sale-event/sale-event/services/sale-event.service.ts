import { Injectable } from '@angular/core';
import { MockCrudStore } from '@sample/services';

import { SALE_EVENT_SEED_DATA } from './sale-event.mock-data';
import { SaleEventDTO, SaleEventSaveReq } from './sale-event.model';

@Injectable()
export class SaleEventService {
  readonly #store = new MockCrudStore<SaleEventDTO, SaleEventSaveReq>(
    'sale-event',
    () => [...SALE_EVENT_SEED_DATA],
    (existing, req) => ({
      ...(existing ?? ({} as SaleEventDTO)),
      code: String(req.code ?? existing?.code ?? ''),
      name: String(req.name ?? existing?.name ?? ''),
      projectName: String(req.projectName ?? existing?.projectName ?? ''),
      sellType: String(req.sellType ?? existing?.sellType ?? 'DIRECT'),
      expectedStartDate: String(req.expectedStartDate ?? existing?.expectedStartDate ?? new Date().toISOString()),
      expectedEndDate: String(req.expectedEndDate ?? existing?.expectedEndDate ?? new Date().toISOString()),
      approvalStatus: String(req.approvalStatus ?? existing?.approvalStatus ?? 'DRAFT'),
      operationStatus: String(req.operationStatus ?? existing?.operationStatus ?? 'INACTIVE'),
      inventoryPoolCount: Number(req.inventoryPoolCount ?? existing?.inventoryPoolCount ?? 0),
      description: String(req.description ?? existing?.description ?? ''),
      note: String(req.note ?? existing?.note ?? ''),
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
