# Screen — List Component Template

Code template referenced from the screen-list reference pack [`screen-list.md`](../write-code/screen-list.md) (loaded on demand by the `sdcorejs-angular` orchestrator). The pack owns the rules and decision logic (server-paging vs client, external filters, audit columns, score cards, etc.); this file holds the literal `list.component.ts` body the skill emits.

Placeholders used throughout: `{{ module }}`, `{{ entity }}` (kebab), `{{ entityPascal }}`, `{{ entityCamel }}`, `{{ entityKebab }}`, `{{ entityLabel }}` / `{{ entityLabelPlural }}`, `{{ permissionCreate }}`, `{{ columnsConfig }}` (the schema-derived column array — see "Column configuration patterns" below).

## Table of contents

- [Full `list.component.ts` template](#full-listcomponentts-template)
- [Column configuration patterns](#column-configuration-patterns)
  - [text](#text)
  - [date](#date)
  - [number with currency format](#number-with-currency-format)
  - [select](#select)
  - [boolean (with custom cellTemplate)](#boolean-with-custom-celltemplate)

---

## Full `list.component.ts` template

```typescript
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SdPageComponent } from '@sdcorejs/angular/modules';
import { BaseService } from '@{{ module }}/services';
import { SdButton, SdTabComponent, SdTabelCellDefDirective, SdTable, SdTableOption, SdTableColumnConfig } from '@sdcorejs/angular/components';
import { SdPermissionDirective } from '@sdcorejs/angular/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '@sdcorejs/angular/services';
import { SdSwitch } from '@sdcorejs/angular/forms';
import { {{ entityPascal }}DTO } from '../../services/{{ entityKebab }}.model';
import { {{ entityPascal }}Service } from '../../services/{{ entityKebab }}.service';

@Component({
  selector: '{{ entityKebab }}-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
          title="<localized text>"
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
            title: '<localized text>',
            action: async (items: {{ entityPascal }}DTO[]) => {
              if (items.length === 0) {
                this.#notifyService.error('<localized text>');
                return;
              }

              const confirmed = await this.#confirmService.alert({
                title: '<localized text>',
                body: `<localized text>`,
                type: 'warning'
              });

              if (!confirmed) return;

              try {
                this.#loadingService.show();
                const ids = items.map(x => x.id);
                await this.#{{ entityCamel }}Service.remove(ids);

                this.#notifyService.success('<localized text>');
                this.table?.reload();
              } catch (error) {
                this.#notifyService.error('<localized text>');
              } finally {
                this.#loadingService.hide();
              }
            }
          }
        ]
      },

      // Table Columns (from schema — see "Column configuration patterns" below)
      columns: [
        {{ columnsConfig }}
        {
          header: '<localized text>',
          key: 'action',
          type: 'action',
          width: '100px',
          buttons: [
            {
              type: 'icon',
              icon: 'edit',
              title: '<localized text>',
              action: (item: {{ entityPascal }}DTO) => this.onEdit(item)
            },
            {
              type: 'icon',
              icon: 'detail',
              title: '<localized text>',
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
      this.#notifyService.success('<localized text>');
    } catch (error) {
      this.#notifyService.error('<localized text>');
      item.isActivated = !item.isActivated; // revert
    } finally {
      this.#loadingService.hide();
    }
  }
}
```

## Column configuration patterns

Substitute `{{ columnsConfig }}` in the template above with one entry per field that has `visibleInList: true` in the EntitySchema. Pick the pattern by field type:

### text

```typescript
{
  header: '<localized text>',
  key: 'code',
  type: 'text',
  width: '120px'
}
```

### date

```typescript
{
  header: '<localized text>',
  key: 'birthday',
  type: 'date',
  format: 'yyyy-MM-dd'
}
```

### number with currency format

```typescript
{
  header: '<localized text>',
  key: 'salary',
  type: 'number',
  format: 'currency'
}
```

### select

```typescript
{
  header: '<localized text>',
  key: 'role',
  type: 'select',
  selectOptions: EMPLOYEE_ROLES
}
```

### boolean (with custom cellTemplate)

```typescript
{
  header: '<localized text>',
  key: 'isActivated',
  type: 'boolean',
  cellTemplate: 'isActivated' // => use custom ng-template inside <sd-table>
}
```

The custom `ng-template sdTableCellDef="isActivated"` is already wired in the main template above — it renders an `<sd-switch>` bound to `onToggleActivation`.
