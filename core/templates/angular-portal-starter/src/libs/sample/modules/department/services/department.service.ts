import { Injectable } from '@angular/core';
import { BaseService } from '@sample/services';
import { DepartmentDTO, DepartmentSaveReq } from './department.model';

@Injectable()
export class DepartmentService extends BaseService {
  readonly #api = this.register<DepartmentDTO, DepartmentSaveReq>('department');

  paging = this.#api.paging;
  search = this.#api.search;
  all = this.#api.all;
  detail = this.#api.detail;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;
}
