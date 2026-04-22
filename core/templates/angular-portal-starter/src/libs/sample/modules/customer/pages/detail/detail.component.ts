import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SdButton, SdSection, SdTabComponent } from '@sd-angular/core/components';
import { SdInput, SdSelect, SdTextarea } from '@sd-angular/core/forms';
import { SdPageComponent } from '@sd-angular/core/modules';
import { SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { CustomerDTO } from '../../services/customer.model';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'customer-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdInput, SdSelect, SdTextarea, SdButton, SdSection, SdPageComponent],
  template: `
    <sd-page [title]="title">
      <div class="d-flex align-items-center" style="gap: 8px" headerRight>
        <sd-button title="Quay lai" prefixIcon="replay" (click)="onBack()"></sd-button>
        @if (state === 'DETAIL') {
          <sd-button title="Cap nhat" type="fill" prefixIcon="edit" color="primary" (click)="onUpdate()"></sd-button>
        } @else {
          <sd-button title="Luu" type="fill" prefixIcon="save" color="primary" (click)="onSave()" [loading]="saving"></sd-button>
        }
      </div>

      <div class="h-full p-8">
        <sd-section title="Thong tin chung">
          <div class="row row-sm mx-0">
            <div class="col-6">
              <sd-input label="Ma" [(model)]="entity.code" [form]="form" required maxlength="32" [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <div class="col-6">
              <sd-input label="Ten" [(model)]="entity.name" [form]="form" required [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <div class="col-6">
              <sd-input label="Email" [(model)]="entity.email" [form]="form" required [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <div class="col-6">
              <sd-input label="So dien thoai" [(model)]="entity.phone" [form]="form" required [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <div class="col-12">
              <sd-input label="Dia chi" [(model)]="entity.address" [form]="form" [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <div class="col-6">
              <sd-select
                label="Trang thai"
                [(model)]="entity.isActivated"
                [form]="form"
                [items]="statusOptions"
                valueField="value"
                displayField="display"
                [viewed]="state === 'DETAIL'">
              </sd-select>
            </div>
            <div class="col-12">
              <sd-textarea label="Ghi chu" [(model)]="entity.note" [form]="form" [viewed]="state === 'DETAIL'"></sd-textarea>
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
    if (args?.url?.includes('update')) return 'Cap nhat khach hang';
    if (args?.url?.includes('detail')) return 'Chi tiet khach hang';
    return 'Tao moi khach hang';
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
  readonly #customerService = inject(CustomerService);

  form = new FormGroup({});
  saving = false;
  entity: Partial<CustomerDTO> = {};
  id = '';
  state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  title = '';
  statusOptions = [
    { value: true, display: 'Hoat dong' },
    { value: false, display: 'Ngung hoat dong' },
  ];

  ngOnInit(): void {
    this.id = this.#route.snapshot.params?.['id'];

    if (this.#router.url.includes('update')) {
      this.state = 'UPDATE';
      this.title = 'Cap nhat khach hang';
    } else if (this.#router.url.includes('detail')) {
      this.state = 'DETAIL';
      this.title = 'Chi tiet khach hang';
    } else {
      this.state = 'CREATE';
      this.title = 'Tao moi khach hang';
    }

    if (this.id) {
      this.#loadDetail(this.id);
    }
  }

  #loadDetail = (id: string) => {
    this.#loadingService.start();
    this.#customerService
      .detail(id)
      .then(entity => {
        this.entity = entity;
      })
      .catch(() => {
        this.#notifyService.warning('Khong tim thay khach hang. Vui long chon lai tu danh sach.');
        this.#router.navigate(['../../'], { relativeTo: this.#route, state: { replaceTab: true } });
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
        await this.#customerService.update(this.entity.id, this.entity);
        this.#notifyService.success('Cap nhat khach hang thanh cong');
        this.#loadDetail(this.id);
      } else {
        const created = await this.#customerService.create(this.entity);
        this.#notifyService.success('Tao moi khach hang thanh cong');
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
