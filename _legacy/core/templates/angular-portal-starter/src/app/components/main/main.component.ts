import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SdLayoutComponent, SdLayoutMenu } from '@sd-angular/core/modules';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SdLayoutComponent, RouterOutlet],
  template: `
    <sd-layout [menus]="menus">
      <router-outlet></router-outlet>
    </sd-layout>
  `,
})
export class MainComponent {
  menus: SdLayoutMenu[] = [
    {
      icon: 'folder_open',
      title: 'Sample Module',
      children: [
        {
          path: '/sample/employee',
          title: 'Employees',
        },
        {
          path: '/sample/product',
          title: 'Products',
        },
        {
          path: '/sample/department',
          title: 'Departments',
        },
        {
          path: '/sample/customer',
          title: 'Customers',
        },
        {
          path: '/sample/sale-event',
          title: 'Sale Events',
        },
      ],
    },
  ];
}
