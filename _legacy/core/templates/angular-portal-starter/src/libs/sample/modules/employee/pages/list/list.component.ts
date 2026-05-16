import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SdPageComponent } from '@sd-angular/core/modules';
import { SdButton, SdTabComponent, SdTabelCellDefDirective, SdTable, SdTableOption } from '@sd-angular/core/components';
import { SdPermissionDirective } from '@sd-angular/core/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '@sd-angular/core/services';
import { SdSwitch } from '@sd-angular/core/forms';
import { EMPLOYEE_ROLES, EmployeeDTO } from '../../services/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'employee-list',
  imports: [SdButton, SdTable, SdTabelCellDefDirective, SdPermissionDirective, SdSwitch, SdPageComponent],
  template: `
    <sd-page title="Nhân viên">
      <div class="d-flex align-items-center" role="toolbar" headerRight>
        <sd-button
          *sdPermission="'SAMPLE_C_EMPLOYEE_CREATE'; sdPermissionKey: 'sample'"
          title="Tạo mới"
          type="fill"
          prefixIcon="add"
          color="primary"
          (click)="onCreate()"></sd-button>
      </div>
      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table [option]="tableOption" #table autoId="sample_employee">
            <ng-template sdTableCellDef="isActivated" let-item="item">
              <sd-switch
                class="d-block text-center"
                [(model)]="item.isActivated"
                (sdChange)="onChangeIsActivated(item)"
                [disabled]="!item.editable"></sd-switch>
            </ng-template>
          </sd-table>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: ListComponent,
  name: 'nhân viên',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<EmployeeDTO>;

  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #notifyService = inject(SdNotifyService);
  readonly #confirmService = inject(SdConfirmService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #employeeService = inject(EmployeeService);

  tableOption!: SdTableOption<EmployeeDTO>;

  ngOnInit(): void {
    this.tableOption = {
      key: 'sample-employee-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      items: async (_, pagingRequest) => {
        return await this.#employeeService.paging(pagingRequest);
      },
      selector: {
        actions: [
          {
            icon: 'delete',
            title: 'Xóa',
            click: rows => {
              this.#confirmService.confirm(`Xóa ${rows.length} dữ liệu đã chọn`).then(() => {
                this.#onRemove(rows.map(e => e.id));
              });
            },
          },
        ],
      },
      columns: [
        {
          title: 'Mã',
          field: 'code',
          type: 'string',
          width: '150px',
          click: (value, row) => this.#onDetail(row.id),
        },
        {
          title: 'Tên',
          field: 'name',
          type: 'string',
          minWidth: '250px',
        },
        {
          title: 'Ngày sinh',
          field: 'birthday',
          type: 'date',
          width: '150px',
        },
        {
          title: 'Vai trò',
          field: 'role',
          type: 'values',
          option: {
            items: EMPLOYEE_ROLES,
            valueField: 'value',
            displayField: 'display',
          },
          width: '200px',
        },
        // {
        //   title: 'Phòng ban',
        //   field: 'department',
        //   type: 'lazy-values',
        //   option: {
        //     items: req => {
        //       return [];
        //     },
        //     valueField: 'value',
        //     displayField: 'display',
        //   },
        //   width: '200px',
        // },
        {
          title: 'Trạng thái',
          field: 'isActivated',
          type: 'boolean',
          option: { displayOnTrue: 'Hoạt động', displayOnFalse: 'Khóa' },
          width: '150px',
        },
        {
          title: 'Ghi chú',
          field: 'note',
          type: 'string',
          width: '300px',
        },
        {
          title: 'Ngày tạo',
          field: 'createdAt',
          type: 'datetime',
          width: '180px',
        },
      ],
    };
  }

  onCreate = () => {
    this.#router.navigate(['create'], { relativeTo: this.#route });
  };

  #onDetail = (id: string) => {
    this.#router.navigate(['detail', id], { relativeTo: this.#route });
  };

  #onRemove = (ids: string[]) => {
    this.#loadingService.start();
    this.#employeeService
      .remove(ids)
      .then(() => {
        this.#notifyService.success('Xóa nhân viên thành công');
        this.table.reload();
      })
      .catch(console.error)
      .finally(() => this.#loadingService.stop());
  };

  onChangeIsActivated = (row: EmployeeDTO) => {
    this.#employeeService.update(row.id, { isActivated: row.isActivated }).catch(console.error);
  };
}
