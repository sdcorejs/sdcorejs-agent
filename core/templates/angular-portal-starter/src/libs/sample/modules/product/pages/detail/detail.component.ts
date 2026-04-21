import { Component, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SdButton, SdSection, SdTabComponent } from '@sd-angular/core/components';
import { SdInput, SdInputNumber, SdSelect, SdTextarea } from '@sd-angular/core/forms';
import { SdPageComponent } from '@sd-angular/core/modules';
import { SdLoadingService, SdNotifyService } from '@sd-angular/core/services';
import { ProductDTO } from '../../services/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'product-detail',
  imports: [SdInput, SdInputNumber, SdSelect, SdTextarea, SdButton, SdSection, SdPageComponent],
  template: `
    <sd-page [title]="title">
      <div class="d-flex align-items-center" style="gap: 8px" headerRight>
        <sd-button title="Quay lại" prefixIcon="replay" (click)="onBack()"></sd-button>
        @if (state === 'DETAIL') {
          <sd-button title="Cập nhật" type="fill" prefixIcon="edit" color="primary" (click)="onUpdate()"></sd-button>
        } @else {
          <sd-button title="Lưu" type="fill" prefixIcon="save" color="primary" (click)="onSave()" [loading]="saving"></sd-button>
        }
      </div>
      <div class="h-full p-8">
        <sd-section title="Thông tin chung">
          <div class="row row-sm mx-0">
            <div class="col-6">
              <sd-input label="Mã" [(model)]="entity.code" [form]="form" required maxlength="32" [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <div class="col-6">
              <sd-input label="Tên" [(model)]="entity.name" [form]="form" required [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <div class="col-6">
              <sd-input-number label="Giá" [(model)]="entity.price" [form]="form" [viewed]="state === 'DETAIL'"></sd-input-number>
            </div>
            <div class="col-6">
              <sd-select
                label="Trạng thái"
                [(model)]="entity.isActivated"
                [form]="form"
                [items]="statusOptions"
                valueField="value"
                displayField="display"
                [viewed]="state === 'DETAIL'"></sd-select>
            </div>
            <div class="col-12">
              <sd-textarea label="Ghi chú" [(model)]="entity.note" [form]="form" [viewed]="state === 'DETAIL'"></sd-textarea>
            </div>
          </div>
        </sd-section>
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: DetailComponent,
  name: args => {
    if (args?.url?.includes('update')) return 'Cập nhật sản phẩm';
    if (args?.url?.includes('detail')) return 'Chi tiết sản phẩm';
    return 'Tạo mới sản phẩm';
  },
  color: args => {
    if (args?.url?.includes('update')) return 'warning';
    if (args?.url?.includes('detail')) return 'info';
    return 'success';
  },
})
export class DetailComponent implements OnInit {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #notifyService = inject(SdNotifyService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #productService = inject(ProductService);

  form = new FormGroup({});
  saving = false;
  entity: Partial<ProductDTO> = {};
  id = '';
  state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  title = '';
  statusOptions = [
    { value: true, display: 'Hoạt động' },
    { value: false, display: 'Ngừng hoạt động' },
  ];

  ngOnInit() {
    this.id = this.#route.snapshot.params?.['id'];

    if (this.#router.url.includes('update')) {
      this.state = 'UPDATE';
      this.title = 'Cập nhật sản phẩm';
    } else if (this.#router.url.includes('detail')) {
      this.state = 'DETAIL';
      this.title = 'Chi tiết sản phẩm';
    } else {
      this.state = 'CREATE';
      this.title = 'Tạo mới sản phẩm';
    }

    if (this.id) {
      this.#loadingService.start();
      this.#productService
        .detail(this.id)
        .then(entity => {
          this.entity = entity;
        })
        .finally(() => this.#loadingService.stop());
    }
  }

  onBack = () => {
    const path = this.state === 'CREATE' ? ['../'] : ['../../'];
    this.#router.navigate(path, { relativeTo: this.#route, state: { replaceTab: true } });
  };

  onUpdate = () => {
    this.#router.navigate(['../../update', this.id], {
      relativeTo: this.#route,
      state: { replaceTab: true },
    });
  };

  onSave = async () => {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    try {
      if (this.entity.id) {
        await this.#productService.update(this.entity.id, this.entity);
        this.#notifyService.success('Cập nhật sản phẩm thành công');
      } else {
        const newEntity = await this.#productService.create(this.entity);
        this.#notifyService.success('Tạo mới sản phẩm thành công');
        this.#router.navigate(['../detail', newEntity.id], {
          relativeTo: this.#route,
          state: { replaceTab: true },
        });
      }
    } finally {
      this.saving = false;
    }
  };
}
