import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ISdApiConfiguration, SdNotifyService } from '@sd-angular/core/services';
import { SAMPLE_CONFIGURATION, ISampleConfiguration } from './sample.configuration';

/**
 * Lớp cấu hình API cục bộ cho module Sample.
 * - Không sử dụng `providedIn: 'root'` để đảm bảo scope của interceptor chỉ nằm trong module này.
 * - Được inject thông qua mảng `providers` ở tầng Route của module.
 */
@Injectable()
export class ApiConfiguration implements ISdApiConfiguration {
  #notifyService = inject(SdNotifyService);
  #configuration = inject<ISampleConfiguration>(SAMPLE_CONFIGURATION);

  handlers: ISdApiConfiguration['handlers'] = [
    {
      hosts: [this.#configuration.host],
      intercept: request => {
        request = request.clone({
          setHeaders: {
          },
        });
        return request;
      },
      afterRemote: response => {
        if (response instanceof HttpErrorResponse && response.status !== 200 && response.status !== 204) {
          this.#notifyService.error(response.error?.meta?.message ?? response.message ?? 'Đã có lỗi xảy ra');
        }
      },
    },
  ];
}
