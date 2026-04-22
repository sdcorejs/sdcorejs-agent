import { Injectable } from '@angular/core';
import { MockCrudStore } from '@sample/services';
import { DepartmentDTO, DepartmentSaveReq } from './department.model';
import { DEPARTMENT_SEED_DATA } from './department.mock-data';

@Injectable()
export class DepartmentService {
  readonly #store = new MockCrudStore<DepartmentDTO, DepartmentSaveReq>(
    'department',
    () => [...DEPARTMENT_SEED_DATA],
    (existing, req) => ({
      ...(existing ?? ({} as DepartmentDTO)),
      code: String(req.code ?? existing?.code ?? ''),
      name: String(req.name ?? existing?.name ?? ''),
      description: String(req.description ?? existing?.description ?? ''),
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
