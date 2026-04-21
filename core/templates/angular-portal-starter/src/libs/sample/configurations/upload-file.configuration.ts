import { ISdUploadFileConfiguration } from '@sd-angular/core/components';

export class UploadFileConfiguration implements ISdUploadFileConfiguration {
  upload: ISdUploadFileConfiguration['upload'] = async (files, args) => {
    return [];
  };

  details: ISdUploadFileConfiguration['details'] = async (idOrKeys, args) => {
    return [];
  };
}
