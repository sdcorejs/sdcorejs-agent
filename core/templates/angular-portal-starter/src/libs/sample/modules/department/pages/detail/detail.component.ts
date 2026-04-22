import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SdButton, SdSection, SdTabComponent } from '@sd-angular/core/components';
import { SdSectionItem } from '@sd-angular/core/components/section';
import { SdInput, SdSelect, SdTextarea } from '@sd-angular/core/forms';
import { SdPageComponent } from '@sd-angular/core/modules';
import { SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { DepartmentDTO } from '../../services/department.model';
import { DepartmentService } from '../../services/department.service';

/**
 * AdaptiveSplitDetail pattern:
 *   - DETAIL state → read-only sd-section + sd-section-item blocks
 *   - CREATE / UPDATE state → standard editable form inside sd-section
 */
@Component({
  selector: 'department-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdInput, SdSelect, SdTextarea, SdButton, SdSection, SdSectionItem, SdPageComponent],
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
        @if (state === 'DETAIL') {
          <!-- AdaptiveSplitDetail: DETAIL uses read-only section-item layout -->
          <sd-section title="Thông tin chung" collapsable>
            <sd-section-item label="Mã" labelWidth="120px">{{ entity.code }}</sd-section-item>
            <sd-section-item label="Tên" labelWidth="120px">{{ entity.name }}</sd-section-item>
            <sd-section-item label="Trạng thái" labelWidth="120px">
              {{ entity.isActivated ? 'Hoạt động' : 'Ngừng hoạt động' }}
            </sd-section-item>
            <sd-section-item label="Mô tả" labelWidth="120px">{{ entity.description }}</sd-section-item>
          </sd-section>
        } @else {
          <!-- CREATE / UPDATE: standard editable form -->
          <sd-section title="Thông tin chung">
            <div class="row row-sm mx-0">
              <div class="col-6">
                <sd-input label="Mã" [(model)]="entity.code" [form]="form" required maxlength="32"></sd-input>
              </div>
              <div class="col-6">
                <sd-input label="Tên" [(model)]="entity.name" [form]="form" required></sd-input>
              </div>
              <div class="col-6">
                <sd-select
                  label="Trạng thái"
                  [(model)]="entity.isActivated"
                  [form]="form"
                  [items]="statusOptions"
                  valueField="value"
                  displayField="display">
                </sd-select>
              </div>
              <div class="col-12">
                <sd-textarea label="Mô tả" [(model)]="entity.description" [form]="form"></sd-textarea>
              </div>
            </div>
          </sd-section>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: DetailComponent,
  name: args => {
    if (args?.url?.includes('update')) return 'Cập nhật phòng ban';
    if (args?.url?.includes('detail')) return 'Chi tiết phòng ban';
    return 'Tạo mới phòng ban';
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
  readonly #departmentService = inject(DepartmentService);

  form = new FormGroup({});
  saving = false;
  entity: Partial<DepartmentDTO> = {};
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
      this.title = 'Cập nhật phòng ban';
    } else if (this.#router.url.includes('detail')) {
      this.state = 'DETAIL';
      this.title = 'Chi tiết phòng ban';
    } else {
      this.state = 'CREATE';
      this.title = 'Tạo mới phòng ban';
    }

    if (this.id) {
      this.#loadDetail(this.id);
    }
  }

  #loadDetail = (id: string) => {
    this.#loadingService.start();
    this.#departmentService
      .detail(id)
      .then(entity => {
        this.entity = entity;
      })
      .finally(() => this.#loadingService.stop());
  };

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
        await this.#departmentService.update(this.entity.id, this.entity);
        this.#notifyService.success('Cập nhật phòng ban thành công');
        this.#loadDetail(this.id);
      } else {
        const created = await this.#departmentService.create(this.entity);
        this.#notifyService.success('Tạo mới phòng ban thành công');
        this.#router.navigate(['../detail', created.id], {
          relativeTo: this.#route,
          state: { replaceTab: true },
        });
      }
    } finally {
      this.saving = false;
    }
  };
}
