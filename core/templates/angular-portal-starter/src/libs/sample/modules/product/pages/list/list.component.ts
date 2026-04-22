import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, viewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { SdButton, SdTabComponent, SdTabelCellDefDirective, SdTable, SdTableOption } from '@sd-angular/core/components';
import { SdSwitch } from '@sd-angular/core/forms';
import { SdPageComponent, SdPermissionDirective } from '@sd-angular/core/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { ProductDTO } from '../../services/product.model';
import { ProductService } from '../../services/product.service';
import { DetailSideDrawerComponent } from '../../components/detail-side-drawer/detail-side-drawer.component';

/**
 * Side-drawer pattern:
 *   All CRUD (Create / Update / Detail) is handled inside a SdSideDrawer
 *   embedded in the list page. No sub-routes are needed.
 */
@Component({
  selector: 'product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SdButton,
    SdTable,
    SdTabelCellDefDirective,
    SdPermissionDirective,
    SdSwitch,
    SdPageComponent,
    DetailSideDrawerComponent,
  ],
  template: `
    <sd-page title="Sản phẩm">
      <div class="d-flex align-items-center" role="toolbar" headerRight>
        <sd-button
          *sdPermission="'SAMPLE_C_PRODUCT_CREATE'; sdPermissionKey: 'sample'"
          title="Tạo mới"
          type="fill"
          prefixIcon="add"
          color="primary"
          (click)="onOpenCreate()">
        </sd-button>
      </div>

      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table [option]="tableOption" #table autoId="sample_product">
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

    <product-detail-side-drawer
      #detailSideDrawer
      [title]="drawerTitle"
      [state]="drawerState"
      [form]="drawerForm"
      [entity]="drawerEntity"
      [saving]="drawerSaving"
      [statusOptions]="statusOptions"
      (closeDrawer)="onDrawerClose()"
      (editDrawer)="onDrawerEdit()"
      (saveDrawer)="onDrawerSave()">
    </product-detail-side-drawer>
  `,
})
@SdTabComponent({
  component: ListComponent,
  name: 'Sản phẩm',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<ProductDTO>;

  readonly detailSideDrawer = viewChild.required<DetailSideDrawerComponent>('detailSideDrawer');
  readonly #notifyService = inject(SdNotifyService);
  readonly #confirmService = inject(SdConfirmService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #productService = inject(ProductService);

  // Drawer state
  drawerForm = new FormGroup({});
  drawerSaving = false;
  drawerEntity: Partial<ProductDTO> = {};
  drawerState: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  drawerTitle = 'Tạo mới sản phẩm';

  statusOptions = [
    { value: true, display: 'Hoạt động' },
    { value: false, display: 'Ngừng hoạt động' },
  ];

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
        {
          title: 'Mã',
          field: 'code',
          type: 'string',
          width: '150px',
          click: (_value, row) => this.#onOpenDetail(row),
        },
        { title: 'Tên', field: 'name', type: 'string', minWidth: '250px' },
        { title: 'Giá', field: 'price', type: 'number', width: '150px' },
        {
          title: 'Trạng thái',
          field: 'isActivated',
          type: 'boolean',
          option: { displayOnTrue: 'Hoạt động', displayOnFalse: 'Khóa' },
          width: '130px',
        },
        { title: 'Ghi chú', field: 'note', type: 'string', minWidth: '200px' },
        { title: 'Ngày tạo', field: 'createdAt', type: 'datetime', width: '180px' },
        { title: 'Người tạo', field: 'createdBy', type: 'string', minWidth: '150px' },
        { title: 'Ngày cập nhật', field: 'updatedAt', type: 'datetime', width: '180px' },
        { title: 'Người cập nhật', field: 'updatedBy', type: 'string', minWidth: '150px' },
      ],
    };
  }

  onOpenCreate = () => {
    this.drawerState = 'CREATE';
    this.drawerTitle = 'Tạo mới sản phẩm';
    this.drawerEntity = {};
    this.drawerForm.reset();
    this.detailSideDrawer().open();
  };

  #onOpenDetail = (row: ProductDTO) => {
    this.drawerState = 'DETAIL';
    this.drawerTitle = 'Chi tiết sản phẩm';
    this.drawerEntity = { ...row };
    this.detailSideDrawer().open();
  };

  onDrawerEdit = () => {
    this.drawerState = 'UPDATE';
    this.drawerTitle = 'Cập nhật sản phẩm';
  };

  onDrawerClose = () => {
    this.detailSideDrawer().close();
  };

  onDrawerSave = async () => {
    if (this.drawerForm.invalid) {
      this.drawerForm.markAllAsTouched();
      return;
    }
    this.drawerSaving = true;
    try {
      if (this.drawerEntity.id) {
        await this.#productService.update(this.drawerEntity.id, this.drawerEntity);
        this.#notifyService.success('Cập nhật sản phẩm thành công');
      } else {
        await this.#productService.create(this.drawerEntity);
        this.#notifyService.success('Tạo mới sản phẩm thành công');
      }
      this.detailSideDrawer().close();
      this.table.reload();
    } finally {
      this.drawerSaving = false;
    }
  };

  #onRemove = (ids: string[]) => {
    this.#loadingService.start();
    this.#productService
      .remove(ids)
      .then(() => {
        this.#notifyService.success('Xóa sản phẩm thành công');
        this.table.reload();
      })
      .finally(() => this.#loadingService.stop());
  };

  onChangeIsActivated = (row: ProductDTO) => {
    this.#productService.update(row.id, { isActivated: row.isActivated }).catch(console.error);
  };
}
