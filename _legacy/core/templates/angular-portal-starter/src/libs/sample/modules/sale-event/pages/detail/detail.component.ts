import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SdAnchorItemV2, SdAnchorV2, SdButton, SdSection, SdTabComponent, SdTable, SdTableOption } from '@sd-angular/core/components';
import { SdSectionItem } from '@sd-angular/core/components/section';
import { SdDatetime, SdInput, SdInputNumber, SdSelect, SdTextarea } from '@sd-angular/core/forms';
import { SdPageComponent } from '@sd-angular/core/modules';
import { SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { SaleEventDTO } from '../../services/sale-event.model';
import { SaleEventService } from '../../services/sale-event.service';

@Component({
  selector: 'sale-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    SdAnchorV2,
    SdAnchorItemV2,
    SdButton,
    SdDatetime,
    SdInput,
    SdInputNumber,
    SdPageComponent,
    SdSection,
    SdSectionItem,
    SdSelect,
    SdTable,
    SdTextarea,
  ],
  template: `
    <sd-page>
      <div class="T20M" headerLeft>
        @if (state === 'DETAIL' && entity.code) {
          Chi tiết đợt mở bán {{ entity.name }} <span class="text-primary">#{{ entity.code }}</span>
        } @else if (state === 'UPDATE' && entity.code) {
          Chỉnh sửa đợt mở bán {{ entity.name }} <span class="text-primary">#{{ entity.code }}</span>
        } @else {
          Tạo mới đợt mở bán
        }
      </div>

      <div class="d-flex align-items-center" style="gap: 8px" headerRight>
        <sd-button title="Bỏ qua" color="primary" (click)="onBack()"></sd-button>
        @if (state === 'DETAIL') {
          <sd-button title="Chỉnh sửa" type="fill" prefixIcon="edit" color="primary" (click)="onUpdate()"></sd-button>
        } @else {
          <sd-button title="Lưu" type="fill" prefixIcon="save" color="primary" (click)="onSave()" [loading]="saving"></sd-button>
        }
      </div>

      @if (state === 'DETAIL') {
        <div class="p-8">
          <div class="row row-sm mx-0">
            <sd-section class="col-4" title="Thông tin chung" noPaddingBody collapsable>
              <sd-section-item label="Mã đợt mở bán" labelWidth="136px">{{ entity.code }}</sd-section-item>
              <sd-section-item label="Tên đợt mở bán" labelWidth="136px">{{ entity.name }}</sd-section-item>
              <sd-section-item label="Dự án" labelWidth="136px">{{ entity.projectName }}</sd-section-item>
              <sd-section-item label="Hình thức bán" labelWidth="136px">{{ entity.sellType }}</sd-section-item>
              <sd-section-item label="Mô tả" labelWidth="136px">{{ entity.description || '--' }}</sd-section-item>
            </sd-section>

            <sd-section class="col-4" title="Thông tin vận hành" noPaddingBody collapsable>
              <sd-section-item label="Trạng thái duyệt" labelWidth="136px">{{ entity.approvalStatus }}</sd-section-item>
              <sd-section-item label="Trạng thái vận hành" labelWidth="136px">{{ entity.operationStatus }}</sd-section-item>
              <sd-section-item label="Bắt đầu" labelWidth="136px">{{ entity.expectedStartDate | date: 'dd/MM/yyyy HH:mm' }}</sd-section-item>
              <sd-section-item label="Kết thúc" labelWidth="136px">{{ entity.expectedEndDate | date: 'dd/MM/yyyy HH:mm' }}</sd-section-item>
              <sd-section-item label="Ghi chú" labelWidth="136px">{{ entity.note || '--' }}</sd-section-item>
            </sd-section>

            <sd-section class="col-4" title="Hồ sơ và rổ hàng" noPaddingBody collapsable>
              <sd-section-item label="Số lượng rổ hàng" labelWidth="136px">{{ entity.inventoryPoolCount }}</sd-section-item>
              <sd-section-item label="Người tạo" labelWidth="136px">{{ entity.createdBy || '--' }}</sd-section-item>
              <sd-section-item label="Ngày tạo" labelWidth="136px">{{ entity.createdAt | date: 'dd/MM/yyyy HH:mm' }}</sd-section-item>
              <sd-section-item label="Người cập nhật" labelWidth="136px">{{ entity.updatedBy || '--' }}</sd-section-item>
              <sd-section-item label="Ngày cập nhật" labelWidth="136px">{{ entity.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</sd-section-item>
            </sd-section>

            <sd-section class="col-12 mt-16" title="Rổ hàng" collapsable>
              <sd-table style="height: 340px" [option]="inventoryTableOption"></sd-table>
            </sd-section>
          </div>
        </div>
      } @else {
        <div class="p-8" style="height: 100%">
          <sd-anchor-v2 type="vertical" ellipsis>
            <sd-anchor-item-v2 title="Thông tin chung">
              <sd-section title="Thông tin chung" noPaddingBody collapsable>
                <div class="row row-sm mx-0 pt-8 px-8">
                  <div class="col-3">
                    <sd-input label="Mã đợt mở bán" [(model)]="entity.code" [form]="form" required maxlength="32"></sd-input>
                  </div>
                  <div class="col-5">
                    <sd-input label="Tên đợt mở bán" [(model)]="entity.name" [form]="form" required maxlength="255"></sd-input>
                  </div>
                  <div class="col-4">
                    <sd-input label="Dự án" [(model)]="entity.projectName" [form]="form" required></sd-input>
                  </div>
                </div>

                <div class="row row-sm mx-0 px-8">
                  <div class="col-6">
                    <sd-select
                      label="Hình thức bán"
                      [(model)]="entity.sellType"
                      [items]="sellTypeItems"
                      valueField="code"
                      displayField="value"
                      [form]="form"
                      required>
                    </sd-select>
                  </div>
                  <div class="col-6">
                    <sd-select
                      label="Trạng thái phê duyệt"
                      [(model)]="entity.approvalStatus"
                      [items]="approvalStatusItems"
                      valueField="code"
                      displayField="value"
                      [form]="form"
                      required>
                    </sd-select>
                  </div>
                </div>

                <div class="row row-sm mx-0 px-8 pb-8">
                  <div class="col-12">
                    <sd-textarea label="Mô tả" [(model)]="entity.description" [form]="form" [rows]="3"></sd-textarea>
                  </div>
                </div>
              </sd-section>
            </sd-anchor-item-v2>

            <sd-anchor-item-v2 title="Thời hạn booking">
              <sd-section class="mt-16" title="Thời hạn booking" noPaddingBody collapsable>
                <div class="row row-sm mx-0 pt-8 px-8 pb-8">
                  <div class="col-6">
                    <sd-datetime label="Ngày bắt đầu dự kiến" [(model)]="entity.expectedStartDate" [form]="form" required></sd-datetime>
                  </div>
                  <div class="col-6">
                    <sd-datetime
                      label="Ngày kết thúc dự kiến"
                      [(model)]="entity.expectedEndDate"
                      [form]="form"
                      [min]="entity.expectedStartDate"
                      required>
                    </sd-datetime>
                  </div>
                  <div class="col-6">
                    <sd-select
                      label="Trạng thái vận hành"
                      [(model)]="entity.operationStatus"
                      [items]="operationStatusItems"
                      valueField="code"
                      displayField="value"
                      [form]="form"
                      required>
                    </sd-select>
                  </div>
                  <div class="col-6">
                    <sd-input-number label="Số lượng rổ hàng" [(model)]="entity.inventoryPoolCount" [form]="form" [min]="0" required></sd-input-number>
                  </div>
                </div>
              </sd-section>
            </sd-anchor-item-v2>

            <sd-anchor-item-v2 title="Rổ hàng">
              <sd-section class="mt-16" title="Rổ hàng" noPaddingBody collapsable>
                <div class="row row-sm mx-0 pt-8 px-8 pb-8">
                  <div class="col-12">
                    <sd-textarea label="Ghi chú" [(model)]="entity.note" [form]="form" [rows]="4"></sd-textarea>
                  </div>
                </div>
                <div class="px-8 pb-8">
                  <sd-table style="height: 340px" [option]="inventoryTableOption"></sd-table>
                </div>
              </sd-section>
            </sd-anchor-item-v2>
          </sd-anchor-v2>
        </div>
      }
    </sd-page>
  `,
})
@SdTabComponent({
  component: DetailComponent,
  name: args => {
    if (args?.url?.includes('update')) return 'Chỉnh sửa đợt mở bán';
    if (args?.url?.includes('detail')) return 'Chi tiết đợt mở bán';
    return 'Tạo mới đợt mở bán';
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
  readonly #saleEventService = inject(SaleEventService);

  form = new FormGroup({});
  saving = false;
  id = '';
  state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  entity: Partial<SaleEventDTO> = {};

  sellTypeItems = [
    { code: 'DIRECT', value: 'Bán trực tiếp' },
    { code: 'BOOKING', value: 'Booking' },
  ];
  approvalStatusItems = [
    { code: 'DRAFT', value: 'Nháp' },
    { code: 'PENDING', value: 'Chờ duyệt' },
    { code: 'APPROVED', value: 'Đã duyệt' },
  ];
  operationStatusItems = [
    { code: 'INACTIVE', value: 'Chưa kích hoạt' },
    { code: 'ACTIVE', value: 'Đang vận hành' },
  ];

  inventoryTableOption: SdTableOption<{ poolCode: string; quantity: number }> = {
    key: 'sample-sale-event-inventory',
    type: 'local',
    columns: [
      { title: 'Mã rổ hàng', field: 'poolCode', type: 'string', width: '200px' },
      { title: 'Số lượng sản phẩm', field: 'quantity', type: 'number', width: '180px' },
    ],
    items: async () => {
      const count = Number(this.entity.inventoryPoolCount ?? 0);
      return Array.from({ length: count }, (_, idx) => ({
        poolCode: `POOL-${String(idx + 1).padStart(3, '0')}`,
        quantity: (idx + 1) * 5,
      }));
    },
  };

  ngOnInit(): void {
    this.id = this.#route.snapshot.params?.['id'] ?? '';

    if (this.#router.url.includes('/update/')) {
      this.state = 'UPDATE';
    } else if (this.#router.url.includes('/detail/')) {
      this.state = 'DETAIL';
    } else {
      this.state = 'CREATE';
    }

    if (this.id) {
      this.#loadDetail(this.id);
    } else {
      this.entity = {
        approvalStatus: 'DRAFT',
        operationStatus: 'INACTIVE',
        sellType: 'DIRECT',
        inventoryPoolCount: 1,
      };
    }
  }

  #loadDetail = async (id: string) => {
    this.#loadingService.start();
    try {
      this.entity = await this.#saleEventService.detail(id);
    } finally {
      this.#loadingService.stop();
    }
  };

  onBack = () => {
    const commands = this.state === 'CREATE' ? ['../'] : ['../../'];
    this.#router.navigate(commands, { relativeTo: this.#route, state: { replaceTab: true } });
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
        await this.#saleEventService.update(this.entity.id, this.entity);
        this.#notifyService.success('Cập nhật đợt mở bán thành công');
        await this.#loadDetail(this.entity.id);
      } else {
        const created = await this.#saleEventService.create(this.entity);
        this.#notifyService.success('Tạo mới đợt mở bán thành công');
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
