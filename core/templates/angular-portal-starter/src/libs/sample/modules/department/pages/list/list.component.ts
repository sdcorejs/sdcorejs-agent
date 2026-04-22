import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SdButton, SdTabComponent, SdTabelCellDefDirective, SdTable, SdTableOption } from '@sd-angular/core/components';
import { SdSwitch } from '@sd-angular/core/forms';
import { SdPageComponent, SdPermissionDirective } from '@sd-angular/core/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { DepartmentDTO } from '../../services/department.model';
import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'department-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdButton, SdTable, SdTabelCellDefDirective, SdPermissionDirective, SdSwitch, SdPageComponent],
  template: `
    <sd-page title="Phòng ban">
      <div class="d-flex align-items-center" role="toolbar" headerRight>
        <sd-button
          *sdPermission="'SAMPLE_C_DEPARTMENT_CREATE'; sdPermissionKey: 'sample'"
          title="Tạo mới"
          type="fill"
          prefixIcon="add"
          color="primary"
          (click)="onCreate()">
        </sd-button>
      </div>
      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table [option]="tableOption" #table autoId="sample_department">
            <ng-template sdTableCellDef="isActivated" let-item="item">
              <sd-switch
                class="d-block text-center"
                [(model)]="item.isActivated"
                (sdChange)="onChangeIsActivated(item)">
              </sd-switch>
            </ng-template>
          </sd-table>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: ListComponent,
  name: 'Phòng ban',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<DepartmentDTO>;

  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #notifyService = inject(SdNotifyService);
  readonly #confirmService = inject(SdConfirmService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #departmentService = inject(DepartmentService);

  tableOption!: SdTableOption<DepartmentDTO>;

  ngOnInit(): void {
    this.tableOption = {
      key: 'sample-department-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      items: async (_, pagingRequest) => {
        return await this.#departmentService.paging(pagingRequest);
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
          click: (_value, row) => this.#onDetail(row.id),
        },
        { title: 'Tên', field: 'name', type: 'string', minWidth: '250px' },
        {
          title: 'Trạng thái',
          field: 'isActivated',
          type: 'boolean',
          option: { displayOnTrue: 'Hoạt động', displayOnFalse: 'Khóa' },
          width: '130px',
        },
        { title: 'Ngày tạo', field: 'createdAt', type: 'datetime', width: '180px' },
        { title: 'Người tạo', field: 'createdBy', type: 'string', minWidth: '150px' },
        { title: 'Ngày cập nhật', field: 'updatedAt', type: 'datetime', width: '180px' },
        { title: 'Người cập nhật', field: 'updatedBy', type: 'string', minWidth: '150px' },
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
    this.#departmentService
      .remove(ids)
      .then(() => {
        this.#notifyService.success('Xóa phòng ban thành công');
        this.table.reload();
      })
      .finally(() => this.#loadingService.stop());
  };

  onChangeIsActivated = (row: DepartmentDTO) => {
    this.#departmentService.update(row.id, { isActivated: row.isActivated }).catch(console.error);
  };
}
