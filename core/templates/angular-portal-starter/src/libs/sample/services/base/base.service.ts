import { inject } from '@angular/core';
import { SdApiService } from '@sd-angular/core/services';
import { SdFilter, SdPagingReq, SdPagingRes } from '@sd-angular/core/utilities';
import { ISampleConfiguration, SAMPLE_CONFIGURATION } from '../../configurations';
import { IBaseRegister } from './base.model';

export class BaseService {
  readonly #apiService = inject(SdApiService);
  readonly #configuration = inject<ISampleConfiguration>(SAMPLE_CONFIGURATION);

  #buildPagingReq = async (req?: SdPagingReq): Promise<SdPagingReq> => {
    return req as SdPagingReq;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register = <TDto = any, TSaveReq = TDto>(entity: string): IBaseRegister<TDto, TSaveReq> => {
    const host = this.#configuration.host;
    if (!host) throw new Error(`Invalid host configuration`);
    const baseUrl = `${host}/${entity}`;

    const paging: IBaseRegister<TDto, TSaveReq>['paging'] = async (pagingReq: SdPagingReq): Promise<SdPagingRes<TDto>> => {
      const req = await this.#buildPagingReq(pagingReq);
      const url = `${baseUrl}/paging`;
      return await this.#apiService
        .post(url, req)
        .then(res => res.data)
        .catch(() => ({ items: [], total: 0 }));
    };

    const search: IBaseRegister<TDto, TSaveReq>['search'] = async (keyword: string, filters?: SdFilter<TDto>[]): Promise<TDto[]> => {
      const url = `${baseUrl}/search?keyword=${encodeURIComponent(keyword)}`;
      return await this.#apiService
        .post(url, filters)
        .then(res => res.data)
        .catch(err => {
          console.error(err);
          return [];
        });
    };

    const all: IBaseRegister<TDto, TSaveReq>['all'] = async () => {
      const url = `${baseUrl}/all`;
      return await this.#apiService
        .get(url)
        .then(res => res?.data || [])
        .catch(err => {
          console.error(err);
          return [];
        });
    };

    const detail: IBaseRegister<TDto, TSaveReq>['detail'] = async (id: string): Promise<TDto> => {
      const url = `${baseUrl}/${id}`;
      const res = await this.#apiService.get(url);
      return res?.data;
    };

    const create: IBaseRegister<TDto, TSaveReq>['create'] = async req => {
      const url = `${baseUrl}`;
      const res = await this.#apiService.post(url, req);
      return res?.data;
    };

    const update: IBaseRegister<TDto, TSaveReq>['update'] = async (id, req) => {
      const url = `${baseUrl}/${id}`;
      const res = await this.#apiService.put(url, req);
      return res?.data;
    };

    const remove: IBaseRegister<TDto, TSaveReq>['remove'] = async (id: string | string[]): Promise<void> => {
      const idsParam = Array.isArray(id) ? id.filter(val => !!val).join(',') : id;
      const url = `${baseUrl}/${encodeURIComponent(idsParam)}`;
      await this.#apiService.delete(url);
    };

    return { host, baseUrl, paging, search, all, detail, create, update, remove };
  };
}
