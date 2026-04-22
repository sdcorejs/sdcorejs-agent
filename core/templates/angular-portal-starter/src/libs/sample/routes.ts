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
      // UnifiedCompact detail page: same layout for CREATE / UPDATE / DETAIL
      { path: 'employee', loadChildren: () => import('@sample/modules/employee').then(m => m.employeeRoutes) },
      // Side-drawer: all CRUD handled inline in list page, no sub-routes
      { path: 'product', loadChildren: () => import('@sample/modules/product').then(m => m.productRoutes) },
      // AdaptiveSplitDetail: DETAIL uses read-only sections, CREATE/UPDATE uses editable form
      { path: 'department', loadChildren: () => import('@sample/modules/department').then(m => m.departmentRoutes) },
      // AdaptiveSplitDetail for customer management
      { path: 'customer', loadChildren: () => import('@sample/modules/customer').then(m => m.customerRoutes) },
      // Anchor-based full page detail/create/update with 3 sections
      { path: 'sale-event', loadChildren: () => import('@sample/modules/sale-event').then(m => m.saleEventRoutes) },
    ],
  },
];
