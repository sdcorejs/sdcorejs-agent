import { Routes } from '@angular/router';
import { ApiConfiguration, UploadFileConfiguration } from './configurations';
import { sampleGuard } from './guards';
import { SD_API_CONFIG } from '@sd-angular/core/services';
import { SD_UPLOAD_FILE_CONFIGURATION } from '@sd-angular/core/components';

export const sampleRoutes: Routes = [
  {
    path: '',
    canActivate: [sampleGuard],
    providers: [
      { provide: SD_API_CONFIG, useClass: ApiConfiguration, multi: true },
      { provide: SD_UPLOAD_FILE_CONFIGURATION, useClass: UploadFileConfiguration, multi: true },
    ],
    children: [
      { path: '', redirectTo: 'employee', pathMatch: 'full' },
      { path: 'employee', loadChildren: () => import('@sample/modules/employee').then(m => m.employeeRoutes) },
      { path: 'product', loadChildren: () => import('@sample/modules/product').then(m => m.productRoutes) },
    ],
  },
];
