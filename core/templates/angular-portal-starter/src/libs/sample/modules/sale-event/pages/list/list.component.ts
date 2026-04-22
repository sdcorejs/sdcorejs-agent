import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SdButton, SdTabComponent, SdTable, SdTableOption } from '@sd-angular/core/components';
import { SdPageComponent, SdPermissionDirective } from '@sd-angular/core/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { SaleEventDTO } from '../../services/sale-event.model';
import { SaleEventService } from '../../services/sale-event.service';

@Component({
  selector: 'sale-event-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdButton, SdTable, SdPermissionDirective, SdPageComponent],
  template: `
    <sd-page title="Đợt mở bán">
      <div class="d-flex align-items-center" role="toolbar" headerRight>
        <sd-button
          *sdPermission="'SAMPLE_C_SALE_EVENT_CREATE'; sdPermissionKey: 'sample'"
          title="Tạo mới"
          type="fill"
          prefixIcon="add"
          color="primary"
          (click)="onCreate()">
        </sd-button>
      </div>

      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table [option]="tableOption" #table autoId="sample_sale_event"></sd-table>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: ListComponent,
  name: 'Đợt mở bán',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<SaleEventDTO>;

  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #notifyService = inject(SdNotifyService);
  readonly #confirmService = inject(SdConfirmService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #saleEventService = inject(SaleEventService);

  tableOption!: SdTableOption<SaleEventDTO>;

  ngOnInit(): void {
    this.tableOption = {
      key: 'sample-sale-event-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      items: async (_, pagingRequest) => {
        return await this.#saleEventService.paging(pagingRequest);
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
        { title: 'Tên đợt mở bán', field: 'name', type: 'string', minWidth: '240px' },
        { title: 'Dự án', field: 'projectName', type: 'string', minWidth: '220px' },
        { title: 'Hình thức bán', field: 'sellType', type: 'string', width: '160px' },
        { title: 'Trạng thái duyệt', field: 'approvalStatus', type: 'string', width: '170px' },
        { title: 'Trạng thái vận hành', field: 'operationStatus', type: 'string', width: '170px' },
        { title: 'Bắt đầu', field: 'expectedStartDate', type: 'datetime', width: '180px' },
        { title: 'Kết thúc', field: 'expectedEndDate', type: 'datetime', width: '180px' },
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
    this.#saleEventService
      .remove(ids)
      .then(() => {
        this.#notifyService.success('Xóa đợt mở bán thành công');
        this.table.reload();
      })
      .finally(() => this.#loadingService.stop());
  };
}
