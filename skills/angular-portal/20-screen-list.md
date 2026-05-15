---
name: angular-portal-screen-list
description: Use when generating or refining a list page (table view with SdTable, server-side paging, external filters, action buttons, audit columns, bulk delete) for an entity. Triggers - "màn list", "trang danh sách", "table view", "list component", "refine list page". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Generic List Component Template

## Template for CRUD List Page

Base on EntitySchema, generates full CRUD list component with SdTable, pagination, delete, toggle isActivated, etc.

### Component Template

```typescript
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SdPageComponent } from '@sd-angular/core/modules';
import { BaseService } from '@{{ module }}/services';
import { SdButton, SdTabComponent, SdTabelCellDefDirective, SdTable, SdTableOption, SdTableColumnConfig } from '@sd-angular/core/components';
import { SdPermissionDirective } from '@sd-angular/core/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '@sd-angular/core/services';
import { SdSwitch } from '@sd-angular/core/forms';
import { {{ entityPascal }}DTO } from '../../services/{{ entityKebab }}.model';
import { {{ entityPascal }}Service } from '../../services/{{ entityKebab }}.service';

@Component({
  selector: '{{ entityKebab }}-list',
  imports: [
    SdButton, 
    SdTable, 
    SdTabelCellDefDirective, 
    SdPermissionDirective, 
    SdSwitch, 
    SdPageComponent
  ],
  template: `
    <sd-page title="{{ entityLabelPlural }}">
      <!-- Header with Create Button -->
      <div class="d-flex align-items-center" headerRight>
        <sd-button
          *sdPermission="'{{ permissionCreate }}'"
          title="Tạo mới"
          type="fill"
          prefixIcon="add"
          size="sm"
          color="primary"
          (click)="onCreate()"
        ></sd-button>
      </div>

      <!-- Table Container -->
      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table 
            [option]="tableOption" 
            #table 
            autoId="{{ module }}_{{ entity }}"
          >
            <!-- Toggle isActivated Column (if boolean field exists) -->
            <ng-template sdTableCellDef="isActivated" let-item="item">
              <sd-switch
                class="d-block text-center"
                [(model)]="item.isActivated"
                (sdChange)="onToggleActivation(item)"
                [disabled]="!item.editable"
              ></sd-switch>
            </ng-template>
          </sd-table>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: ListComponent,
  name: '{{ entityLabel }}',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<{{ entityPascal }}DTO>;

  readonly #router = inject(Router);
  readonly #notifyService = inject(SdNotifyService);
  readonly #confirmService = inject(SdConfirmService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #baseService = inject(BaseService);
  readonly #{{ entityCamel }}Service = inject({{ entityPascal }}Service);

  tableOption!: SdTableOption<{{ entityPascal }}DTO>;

  ngOnInit(): void {
    this.initTable();
  }

  private initTable(): void {
    this.tableOption = {
      key: '{{ module }}-{{ entity }}-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      
      // Paging from API
      items: async filterRequest => {
        const pagingRequest = await this.#baseService.convertTableFilter(filterRequest, {
          columns: this.tableOption.columns,
          externalFilters: this.tableOption.filter?.externalFilters,
        });
        return await this.#{{ entityCamel }}Service.paging(pagingRequest);
      },
      
      // Delete Action
      selector: {
        actions: [
          {
            icon: 'delete',
            title: '删除',
            action: async (items: {{ entityPascal }}DTO[]) => {
              if (items.length === 0) {
                this.#notifyService.error('请选择数据');
                return;
              }
              
              const confirmed = await this.#confirmService.alert({
                title: '确认删除',
                body: `确认删除选中的 ${items.length} 项吗？`,
                type: 'warning'
              });
              
              if (!confirmed) return;
              
              try {
                this.#loadingService.show();
                const ids = items.map(x => x.id);
                await this.#{{ entityCamel }}Service.remove(ids);
                
                this.#notifyService.success('删除成功');
                this.table?.reload();
              } catch (error) {
                this.#notifyService.error('删除失败');
              } finally {
                this.#loadingService.hide();
              }
            }
          }
        ]
      },
      
      // Table Columns (from schema)
      columns: [
        {{ columnsConfig }}
        {
          header: '操作',
          key: 'action',
          type: 'action',
          width: '100px',
          buttons: [
            {
              type: 'icon',
              icon: 'edit',
              title: '编辑',
              action: (item: {{ entityPascal }}DTO) => this.onEdit(item)
            },
            {
              type: 'icon',
              icon: 'detail',
              title: '详情',
              action: (item: {{ entityPascal }}DTO) => this.onDetail(item)
            }
          ]
        }
      ]
    };
  }

  onCreate(): void {
    this.#router.navigate(['create'], { 
      relativeTo: this.#activatedRoute 
    });
  }

  onEdit(item: {{ entityPascal }}DTO): void {
    this.#router.navigate(['update', item.id], { 
      relativeTo: this.#activatedRoute 
    });
  }

  onDetail(item: {{ entityPascal }}DTO): void {
    this.#router.navigate(['detail', item.id], { 
      relativeTo: this.#activatedRoute 
    });
  }

  async onToggleActivation(item: {{ entityPascal }}DTO): Promise<void> {
    try {
      this.#loadingService.show();
      await this.#{{ entityCamel }}Service.update(item.id, { isActivated: item.isActivated });
      this.#notifyService.success('更新成功');
    } catch (error) {
      this.#notifyService.error('更新失败');
      item.isActivated = !item.isActivated; // revert
    } finally {
      this.#loadingService.hide();
    }
  }
}
```

### Column Configuration Generation

For each field in schema with `visibleInList: true`:

```typescript
// Example for code field:
{
  header: 'Mã sản phẩm',
  key: 'code',
  type: 'text',
  width: '120px'
}

// Example for date field:
{
  header: 'Ngày sinh',
  key: 'birthday',
  type: 'date',
  format: 'yyyy-MM-dd'
}

// Example for decimal field with currency format:
{
  header: 'Lương',
  key: 'salary',
  type: 'number',
  format: 'currency'
}

// Example for select field:
{
  header: 'Chức vụ',
  key: 'role',
  type: 'select',
  selectOptions: EMPLOYEE_ROLES
}

// Example for boolean field:
{
  header: 'Kích hoạt',
  key: 'isActivated',
  type: 'boolean',
  cellTemplate: 'isActivated' // => use custom ng-template
}
```

### AI Generation Checklist

✅ Import statements based on EntitySchema fields  
✅ Component decorator with @SdTabComponent  
✅ Table initialization in ngOnInit  
✅ Paging call to service.paging()  
✅ Delete action with confirmation  
✅ Column array generated from visibleInList fields  
✅ Action buttons (edit, detail)  
✅ Toggle isActivated if field exists  
✅ Navigation to create/update/detail routes  
✅ Loading/notification service calls  
