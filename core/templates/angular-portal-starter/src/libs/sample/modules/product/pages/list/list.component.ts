import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SdButton, SdTabComponent, SdTabelCellDefDirective, SdTable, SdTableOption } from '@sd-angular/core/components';
import { SdSwitch } from '@sd-angular/core/forms';
import { SdPageComponent, SdPermissionDirective } from '@sd-angular/core/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '@sd-angular/core/services';
import { ProductDTO } from '../../services/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'product-list',
  imports: [SdButton, SdTable, SdTabelCellDefDirective, SdPermissionDirective, SdSwitch, SdPageComponent],
  template: `
    <sd-page title="sản phẩm">
      <div class="d-flex align-items-center" headerRight>
        <sd-button
          *sdPermission="'SAMPLE_PRODUCT_CREATE'"
          title="Tạo mới"
          type="fill"
          prefixIcon="add"
          size="sm"
          color="primary"
          (click)="onCreate()"></sd-button>
      </div>
      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table [option]="tableOption" #table autoId="sample_product">
            <ng-template sdTableCellDef="isActivated" let-item="item">
              <sd-switch class="d-block text-center" [(model)]="item.isActivated" (sdChange)="onChangeIsActivated(item)"></sd-switch>
            </ng-template>
          </sd-table>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: ListComponent,
  name: 'sản phẩm',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<ProductDTO>;

  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #notifyService = inject(SdNotifyService);
  readonly #confirmService = inject(SdConfirmService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #productService = inject(ProductService);

  tableOption!: SdTableOption<ProductDTO>;

  ngOnInit(): void {
    this.tableOption = {
      key: 'sample-product-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      items: async (_, pagingRequest) => {
        return await this.#productService.paging(pagingRequest);
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
        { title: 'Mã', field: 'code', type: 'string', width: '150px', click: (value, row) => this.#onDetail(row.id) },
        { title: 'Tên', field: 'name', type: 'string', minWidth: '250px' },
        { title: 'Giá', field: 'price', type: 'number', width: '150px' },
        {
          title: 'Trạng thái',
          field: 'isActivated',
          type: 'boolean',
          option: { displayOnTrue: 'Hoạt động', displayOnFalse: 'Khóa' },
          width: '150px',
        },
        { title: 'Ghi chú', field: 'note', type: 'string', width: '300px' },
        { title: 'Ngày tạo', field: 'createdAt', type: 'datetime', width: '180px' },
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
    this.#productService
      .remove(ids)
      .then(() => {
        this.#notifyService.success('Xóa sản phẩm thành công');
        this.table.reload();
      })
      .catch(console.error)
      .finally(() => this.#loadingService.stop());
  };

  onChangeIsActivated = (row: ProductDTO) => {
    this.#productService.update(row.id, { isActivated: row.isActivated }).catch(console.error);
  };
}
