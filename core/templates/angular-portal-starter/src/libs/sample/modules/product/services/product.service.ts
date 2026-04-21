import { Injectable } from '@angular/core';
import { BaseService } from '@sample/services';
import { ProductDTO, ProductSaveReq } from './product.model';

@Injectable()
export class ProductService extends BaseService {
  readonly #api = this.register<ProductDTO, ProductSaveReq>('product');

  paging = this.#api.paging;
  search = this.#api.search;
  all = this.#api.all;
  detail = this.#api.detail;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;
}
