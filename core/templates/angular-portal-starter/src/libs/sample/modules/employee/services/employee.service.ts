import { Injectable } from '@angular/core';
import { BaseService } from '@sample/services';
import { EmployeeDTO, EmployeeSaveReq } from './employee.model';

@Injectable()
export class EmployeeService extends BaseService {
  readonly #api = this.register<EmployeeDTO, EmployeeSaveReq>('employee');

  paging = this.#api.paging;
  search = this.#api.search;
  all = this.#api.all;
  detail = this.#api.detail;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;
}
