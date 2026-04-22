import { Injectable } from '@angular/core';
import { MockCrudStore } from '@sample/services';
import { EmployeeDTO, EmployeeSaveReq } from './employee.model';
import { EMPLOYEE_SEED_DATA } from './employee.mock-data';

@Injectable()
export class EmployeeService {
  readonly #store = new MockCrudStore<EmployeeDTO, EmployeeSaveReq>(
    'employee',
    () => [...EMPLOYEE_SEED_DATA],
    (existing, req) => ({
      ...(existing ?? ({} as EmployeeDTO)),
      code: String(req.code ?? existing?.code ?? ''),
      name: String(req.name ?? existing?.name ?? ''),
      salary: Number(req.salary ?? existing?.salary ?? 0),
      birthday: String(req.birthday ?? existing?.birthday ?? new Date().toISOString()),
      role: String(req.role ?? existing?.role ?? 'EMPLOYEE'),
      isActivated: Boolean(req.isActivated ?? existing?.isActivated ?? true),
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
