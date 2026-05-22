import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, viewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { SdButton, SdSection } from '@sd-angular/core/components';
import { SdSideDrawer } from '@sd-angular/core/components/side-drawer';
import { SdInput, SdInputNumber, SdSelect, SdTextarea } from '@sd-angular/core/forms';
import { SdPermissionDirective } from '@sd-angular/core/modules';

import { ProductSaveReq } from '../../services/product.model';

@Component({
  selector: 'product-detail-side-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdSideDrawer, SdSection, SdInput, SdInputNumber, SdSelect, SdTextarea, SdButton, SdPermissionDirective],
  template: `
    <sd-side-drawer #drawer width="60vw" alwaysDisplayBackDrop>
      <div sdHeaderLeft>
        <div class="d-flex align-items-center justify-content-between">
          <div class="mr-12">{{ title }}</div>
        </div>
      </div>

      <div sdBody>
        <sd-section title="Thông tin chung" class="mt-8" collapsable noPaddingBody>
          <div class="row row-sm mx-0 pt-8 px-8">
            <div class="col-12">
              <sd-input label="Mã" [(model)]="entity.code" [form]="form" required maxlength="32" [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <div class="col-12">
              <sd-input label="Tên" [(model)]="entity.name" [form]="form" required [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <div class="col-12">
              <sd-input-number label="Giá" [(model)]="entity.price" [form]="form" [viewed]="state === 'DETAIL'"></sd-input-number>
            </div>
            <div class="col-12">
              <sd-select
                label="Trạng thái"
                [(model)]="entity.isActivated"
                [form]="form"
                [items]="statusOptions"
                valueField="value"
                displayField="display"
                [viewed]="state === 'DETAIL'">
              </sd-select>
            </div>
            <div class="col-12">
              <sd-textarea label="Ghi chú" [(model)]="entity.note" [form]="form" [viewed]="state === 'DETAIL'"></sd-textarea>
            </div>
          </div>
        </sd-section>
      </div>

      <div sdFooter class="d-flex justify-content-end">
        <sd-button title="Bỏ qua" class="mr-8" type="light" color="secondary" (click)="closeDrawer.emit()"></sd-button>
        @if (state === 'DETAIL') {
          <sd-button
            *sdPermission="'SAMPLE_C_PRODUCT_UPDATE'; sdPermissionKey: 'sample'"
            title="Chỉnh sửa"
            class="mr-8"
            type="fill"
            prefixIcon="edit"
            color="primary"
            (click)="editDrawer.emit()">
          </sd-button>
        } @else if (state === 'UPDATE') {
          <sd-button
            title="Lưu"
            class="mr-8"
            *sdPermission="'SAMPLE_C_PRODUCT_UPDATE'; sdPermissionKey: 'sample'"
            type="fill"
            prefixIcon="save"
            color="primary"
            (click)="saveDrawer.emit()"
            [loading]="saving">
          </sd-button>
        } @else if (state === 'CREATE') {
          <sd-button
            *sdPermission="'SAMPLE_C_PRODUCT_CREATE'; sdPermissionKey: 'sample'"
            title="Lưu"
            class="mr-8"
            type="fill"
            prefixIcon="save"
            color="primary"
            (click)="saveDrawer.emit()"
            [loading]="saving">
          </sd-button>
        }
      </div>
    </sd-side-drawer>
  `,
})
export class DetailSideDrawerComponent {
  @Input() title = '';
  @Input() state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) entity!: Partial<ProductSaveReq & { id?: string }>;
  @Input() saving = false;
  @Input() statusOptions: Array<{ value: boolean; display: string }> = [];

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() editDrawer = new EventEmitter<void>();
  @Output() saveDrawer = new EventEmitter<void>();

  readonly drawer = viewChild.required<SdSideDrawer>('drawer');

  open = () => {
    this.drawer().open();
  };

  close = () => {
    this.drawer().close();
  };
}
