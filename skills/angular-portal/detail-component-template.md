# Generic Detail Component Template

## Template for CRUD Detail Page

Handles CREATE / UPDATE / DETAIL states. Form fields auto-generated from EntitySchema.

### Component Template

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SdPageComponent } from '@sd-angular/core/modules';
import { SdButton, SdTabComponent } from '@sd-angular/core/components';
import { 
  SdInput, 
  SdInputNumber, 
  SdDate, 
  SdDatetime, 
  SdSelect, 
  SdSwitch, 
  SdTextarea,
  SdUploadFile 
} from '@sd-angular/core/forms';
import { SdPermissionDirective } from '@sd-angular/core/modules';
import { SdLoadingService, SdNotifyService } from '@sd-angular/core/services';
import { {{ entityPascal }}DTO, {{ entityPascal }}SaveReq } from '../../services/{{ entityKebab }}.model';
import { {{ entityPascal }}Service } from '../../services/{{ entityKebab }}.service';

type ViewState = 'CREATE' | 'UPDATE' | 'DETAIL';

@Component({
  selector: '{{ entityKebab }}-detail',
  imports: [
    SdButton,
    SdPageComponent,
    SdTabComponent,
    SdPermissionDirective,
    // Form Controls
    SdInput,
    SdInputNumber,
    SdDate,
    SdDatetime,
    SdSelect,
    SdSwitch,
    SdTextarea,
    SdUploadFile
  ],
  template: `
    <sd-page [title]="pageTitle">
      <!-- Header with Action Buttons -->
      <div class="d-flex align-items-center gap-8" headerRight>
        <sd-button
          title="返回"
          type="outline"
          prefixIcon="arrow-left"
          size="sm"
          (click)="onBack()"
        ></sd-button>

        @if (viewState === 'DETAIL') {
          <sd-button
            *sdPermission="'{{ permissionUpdate }}'"
            title="编辑"
            type="fill"
            prefixIcon="edit"
            size="sm"
            color="primary"
            (click)="onEdit()"
          ></sd-button>
        }

        @if (viewState === 'CREATE' || viewState === 'UPDATE') {
          <sd-button
            title="保存"
            type="fill"
            prefixIcon="save"
            size="sm"
            color="primary"
            (click)="onSave()"
            [disabled]="!form.valid || isSubmitting"
          ></sd-button>
        }
      </div>

      <!-- Form Container -->
      <div class="p-8">
        @if (form) {
          <form [formGroup]="form">
            {{ formSectionTemplate }}
          </form>
        } @else {
          <div class="text-center p-16">加载中...</div>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: DetailComponent,
  name: '{{ conditionalTabName }}',
  color: '{{ conditionalTabColor }}'
})
export class DetailComponent implements OnInit {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #fb = inject(FormBuilder);
  readonly #loadingService = inject(SdLoadingService);
  readonly #notifyService = inject(SdNotifyService);
  readonly #{{ entityCamel }}Service = inject({{ entityPascal }}Service);

  viewState: ViewState = 'CREATE';
  pageTitle: string = '';
  isSubmitting = false;
  form!: FormGroup;
  data?: {{ entityPascal }}DTO;

  ngOnInit(): void {
    this.initForm();
    this.detectViewState();
  }

  private initForm(): void {
    this.form = this.#fb.group({
      {{ formControlsConfig }}
    });
  }

  private detectViewState(): void {
    // Check route params: create | detail/:id | update/:id
    this.#route.params.subscribe(async params => {
      if (params['id']) {
        // Load entity data
        await this.loadEntityData(params['id']);
        
        // Determine state based on route
        const routeSegment = this.#route.snapshot.url[0]?.path;
        this.viewState = routeSegment === 'update' ? 'UPDATE' : 'DETAIL';
        
        this.updateFormState();
      } else {
        // Create mode
        this.viewState = 'CREATE';
        this.pageTitle = `新增{{ entityLabel }}`;
        this.form.enable();
      }
    });
  }

  private async loadEntityData(id: string): Promise<void> {
    try {
      this.#loadingService.show();
      this.data = await this.#{{ entityCamel }}Service.detail(id);
      
      // Populate form with data
      this.form.patchValue(this.data, { emitEvent: false });
      
      // Update page title
      const displayName = this.data['name'] || this.data['code'] || id;
      this.pageTitle = `{{ entityLabel }}: ${displayName}`;
      
      this.updateFormState();
    } catch (error) {
      this.#notifyService.error('加载数据失败');
      this.#router.navigate(['..'], { relativeTo: this.#route });
    } finally {
      this.#loadingService.hide();
    }
  }

  private updateFormState(): void {
    if (this.viewState === 'DETAIL') {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  onBack(): void {
    this.#router.navigate(['..'], { relativeTo: this.#route });
  }

  onEdit(): void {
    this.#router.navigate(['update', this.data?.id], { 
      relativeTo: this.#route.parent 
    });
  }

  async onSave(): Promise<void> {
    if (!this.form.valid) {
      this.#notifyService.error('请填写必填项');
      return;
    }

    try {
      this.isSubmitting = true;
      this.#loadingService.show();

      const formValue = this.form.getRawValue() as {{ entityPascal }}SaveReq;

      if (this.viewState === 'CREATE') {
        await this.#{{ entityCamel }}Service.create(formValue);
        this.#notifyService.success('创建成功');
      } else {
        await this.#{{ entityCamel }}Service.update(this.data!.id, formValue);
        this.#notifyService.success('更新成功');
      }

      // Navigate back to list
      this.#router.navigate(['../..'], { relativeTo: this.#route });
    } catch (error) {
      this.#notifyService.error(this.viewState === 'CREATE' ? '创建失败' : '更新失败');
    } finally {
      this.isSubmitting = false;
      this.#loadingService.hide();
    }
  }
}
```

### Form Controls Generation

For each field in schema with `visibleInDetail: true`:

```typescript
// Example: code (required string, maxlength 16)
code: ['', [Validators.required, Validators.maxLength(16)]],

// Example: name (required string)
name: ['', [Validators.required]],

// Example: birthday (optional date)
birthday: [''],

// Example: salary (optional decimal, min 0)
salary: ['', [Validators.min(0)]],

// Example: role (optional select)
role: [''],

// Example: isActivated (optional boolean)
isActivated: [false],

// Example: note (optional textarea)
note: ['']
```

Result:
```typescript
const formControlsConfig = `
  code: ['', [Validators.required, Validators.maxLength(16)]],
  name: ['', [Validators.required]],
  birthday: [''],
  role: [''],
  salary: ['', [Validators.min(0)]],
  isActivated: [false],
  note: ['']
`;
```

### Form Template Generation

Group fields by `section` or all together if no sections:

```html
<!-- If no sections in schema -->
<sd-section title="基本信息">
  {{ allFormFields }}
</sd-section>

<!-- If sections exist in schema -->
@for (section of formSections; track section.name) {
  <sd-section [title]="section.title">
    @for (field of section.fields; track field.name) {
      {{ renderFormField(field) }}
    }
  </sd-section>
}
```

### Form Field Rendering

For each field, render appropriate control based on type:

```html
<!-- String Field -->
<sd-input
  formControlName="code"
  label="Mã sản phẩm"
  [readonly]="viewState === 'DETAIL'"
  [required]="true"
  maxLength="16"
  placeholder="Nhập mã sản phẩm"
></sd-input>

<!-- Number Field -->
<sd-input-number
  formControlName="salary"
  label="Lương"
  [readonly]="viewState === 'DETAIL'"
  [min]="0"
  [decimals]="2"
></sd-input-number>

<!-- Date Field -->
<sd-date
  formControlName="birthday"
  label="Ngày sinh"
  [readonly]="viewState === 'DETAIL'"
></sd-date>

<!-- Datetime Field -->
<sd-datetime
  formControlName="effectiveTime"
  label="Thời gian có hiệu lực"
  [readonly]="viewState === 'DETAIL'"
></sd-datetime>

<!-- Select Field (Static Options) -->
<sd-select
  formControlName="role"
  label="Chức vụ"
  [readonly]="viewState === 'DETAIL'"
  [items]="EMPLOYEE_ROLES"
  [valueField]="'value'"
  [labelField]="'display'"
></sd-select>

<!-- Select Field (Dynamic from API) -->
<sd-select
  formControlName="departmentId"
  label="Phòng ban"
  [readonly]="viewState === 'DETAIL'"
  [apiEndpoint]="'/api/departments'"
  [valueField]="'id'"
  [labelField]="'name'"
></sd-select>

<!-- Boolean Field -->
<sd-switch
  formControlName="isActivated"
  label="Kích hoạt"
  [disabled]="viewState === 'DETAIL'"
></sd-switch>

<!-- Textarea Field -->
<sd-textarea
  formControlName="note"
  label="Ghi chú"
  [readonly]="viewState === 'DETAIL'"
  rows="5"
></sd-textarea>

<!-- File Upload Field -->
<sd-upload-file
  formControlName="image"
  label="Hình ảnh"
  [readonly]="viewState === 'DETAIL'"
  [multiple]="false"
  acceptTypes=".jpg,.png,.gif"
></sd-upload-file>

<!-- Rich Text Editor -->
<sd-editor
  formControlName="description"
  label="Mô tả chi tiết"
  [readonly]="viewState === 'DETAIL'"
></sd-editor>
```

### AI Generation Checklist

✅ Component decorator with conditional @SdTabComponent name/color  
✅ Form initialization with controls from schema  
✅ Route params detection (create vs detail/:id vs update/:id)  
✅ Data loading for detail/update states  
✅ Form state management (disabled in DETAIL, enabled in CREATE/UPDATE)  
✅ View state transitions (CREATE → UPDATE → DETAIL)  
✅ Form field rendering based on field type  
✅ Section grouping if defined in schema  
✅ Validation rules from schema  
✅ API calls: create(), update(), detail()  
✅ Navigation: back, edit, save flows  
✅ Loading/notification service integration  
✅ Error handling and form state reset  

### Conditional Tab Name & Color

```typescript
get pageTabName(): string {
  switch (this.viewState) {
    case 'CREATE': return `新增{{ entityLabel }}`;
    case 'UPDATE': return `编辑{{ entityLabel }}`;
    case 'DETAIL': return `{{ entityLabel }}详情`;
    default: return '{{ entityLabel }}';
  }
}

get pageTabColor(): string {
  switch (this.viewState) {
    case 'CREATE': return 'success';
    case 'UPDATE': return 'warning';
    case 'DETAIL': return 'primary';
    default: return 'primary';
  }
}
```
