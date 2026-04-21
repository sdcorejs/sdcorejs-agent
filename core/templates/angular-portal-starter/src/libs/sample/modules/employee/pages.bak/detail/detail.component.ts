import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h2>Employee Detail</h2>`,
})
export class EmployeeDetailComponent {}
