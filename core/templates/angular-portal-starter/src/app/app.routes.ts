import { Routes } from '@angular/router';
import { SdAuthGuard, SdPermissionGuard, SdPortalGuard } from '@sd-angular/core/modules';
import { MainComponent } from './components/main/main.component';
import { SAMPLE_CONFIGURATION } from '@sample/configurations';
import { SampleConfiguration } from './configurations/sample.configuration';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'layout/home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainComponent,
    canActivate: [SdAuthGuard, SdPermissionGuard],
    canActivateChild: [SdPermissionGuard],
    children: [
      {
        path: '',
        canActivate: [SdPortalGuard],
        children: [
          {
            path: 'layout',
            loadChildren: () => import('@sd-angular/core/modules/layout').then(m => m.SdLayoutModule),
          },
          {
            path: 'sample',
            providers: [{ provide: SAMPLE_CONFIGURATION, useClass: SampleConfiguration }],
            loadChildren: () => import('@sample').then(m => m.sampleRoutes),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'layout/not-found',
    pathMatch: 'full',
  },
];
