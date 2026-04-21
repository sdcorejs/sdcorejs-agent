import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h2>Employee List</h2>`,
})
export class EmployeeListComponent {}
