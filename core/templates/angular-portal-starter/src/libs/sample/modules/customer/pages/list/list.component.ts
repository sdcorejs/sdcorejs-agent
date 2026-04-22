import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SdButton, SdTabComponent, SdTabelCellDefDirective, SdTable, SdTableOption } from '@sd-angular/core/components';
import { SdSwitch } from '@sd-angular/core/forms';
import { SdPageComponent, SdPermissionDirective } from '@sd-angular/core/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { CustomerDTO } from '../../services/customer.model';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'customer-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdButton, SdTable, SdTabelCellDefDirective, SdPermissionDirective, SdSwitch, SdPageComponent],
  template: `
    <sd-page title="Khach hang">
      <div class="d-flex align-items-center" role="toolbar" headerRight>
        <sd-button
          *sdPermission="'SAMPLE_C_CUSTOMER_CREATE'; sdPermissionKey: 'sample'"
          title="Tao moi"
          type="fill"
          prefixIcon="add"
          color="primary"
          (click)="onCreate()">
        </sd-button>
      </div>

      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table [option]="tableOption" #table autoId="sample_customer">
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
  name: 'Khach hang',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<CustomerDTO>;

  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #notifyService = inject(SdNotifyService);
  readonly #confirmService = inject(SdConfirmService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #customerService = inject(CustomerService);

  tableOption!: SdTableOption<CustomerDTO>;

  ngOnInit(): void {
    this.tableOption = {
      key: 'sample-customer-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      items: async (_, pagingRequest) => {
        return await this.#customerService.paging(pagingRequest);
      },
      selector: {
        actions: [
          {
            icon: 'delete',
            title: 'Xoa',
            click: rows => {
              this.#confirmService.confirm(`Xoa ${rows.length} du lieu da chon`).then(() => {
                this.#onRemove(rows.map(e => e.id));
              });
            },
          },
        ],
      },
      columns: [
        {
          title: 'Ma',
          field: 'code',
          type: 'string',
          width: '130px',
          click: (_value, row) => this.#onDetail(row.id),
        },
        { title: 'Ten', field: 'name', type: 'string', minWidth: '220px' },
        { title: 'Email', field: 'email', type: 'string', minWidth: '240px' },
        { title: 'So dien thoai', field: 'phone', type: 'string', width: '160px' },
        {
          title: 'Trang thai',
          field: 'isActivated',
          type: 'boolean',
          option: { displayOnTrue: 'Hoat dong', displayOnFalse: 'Khoa' },
          width: '130px',
        },
        { title: 'Ngay tao', field: 'createdAt', type: 'datetime', width: '180px' },
        { title: 'Nguoi tao', field: 'createdBy', type: 'string', minWidth: '140px' },
        { title: 'Ngay cap nhat', field: 'updatedAt', type: 'datetime', width: '180px' },
        { title: 'Nguoi cap nhat', field: 'updatedBy', type: 'string', minWidth: '140px' },
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
    this.#customerService
      .remove(ids)
      .then(() => {
        this.#notifyService.success('Xoa khach hang thanh cong');
        this.table.reload();
      })
      .finally(() => this.#loadingService.stop());
  };

  onChangeIsActivated = (row: CustomerDTO) => {
    this.#customerService.update(row.id, { isActivated: row.isActivated }).catch(console.error);
  };
}
