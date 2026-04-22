import { Injectable } from '@angular/core';
import { MockCrudStore } from '@sample/services';
import { ProductDTO, ProductSaveReq } from './product.model';
import { PRODUCT_SEED_DATA } from './product.mock-data';

@Injectable()
export class ProductService {
  readonly #store = new MockCrudStore<ProductDTO, ProductSaveReq>(
    'product',
    () => [...PRODUCT_SEED_DATA],
    (existing, req) => ({
      ...(existing ?? ({} as ProductDTO)),
      code: String(req.code ?? existing?.code ?? ''),
      name: String(req.name ?? existing?.name ?? ''),
      price: Number(req.price ?? existing?.price ?? 0),
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
