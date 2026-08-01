import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const files = {
  'package.json': `${JSON.stringify(
    {
      name: 'sdcorejs-angular-golden',
      version: '0.0.0',
      private: true,
      scripts: {
        typecheck: 'tsc -p tsconfig.app.json --noEmit',
        'validate:templates': 'node scripts/validate-template.mjs',
        build: 'ng build --configuration production',
        test: 'ng test --watch=false --browsers=ChromeHeadless',
        lint: 'node scripts/lint.mjs',
      },
      dependencies: {
        '@angular/common': '20.3.27',
        '@angular/compiler': '20.3.27',
        '@angular/core': '20.3.27',
        '@angular/forms': '20.3.27',
        '@angular/platform-browser': '20.3.27',
        '@angular/router': '20.3.27',
        rxjs: '7.8.2',
        tslib: '2.8.1',
        'zone.js': '0.15.1',
      },
      devDependencies: {
        '@angular/build': '20.3.27',
        '@angular/cli': '20.3.27',
        '@angular/compiler-cli': '20.3.27',
        '@types/jasmine': '5.1.9',
        'jasmine-core': '5.9.0',
        karma: '6.4.4',
        'karma-chrome-launcher': '3.2.0',
        'karma-coverage': '2.2.1',
        'karma-jasmine': '5.1.0',
        'karma-jasmine-html-reporter': '2.1.0',
        typescript: '5.9.3',
      },
    },
    null,
    2,
  )}\n`,
  'angular.json': `${JSON.stringify(
    {
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      projects: {
        golden: {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          prefix: 'app',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: {
                browser: 'src/main.ts',
                polyfills: ['zone.js'],
                tsConfig: 'tsconfig.app.json',
                inlineStyleLanguage: 'css',
                styles: ['src/styles.css'],
              },
              configurations: {
                production: {
                  outputHashing: 'all',
                  budgets: [
                    {
                      type: 'initial',
                      maximumWarning: '500kB',
                      maximumError: '1MB',
                    },
                  ],
                },
              },
              defaultConfiguration: 'production',
            },
            test: {
              builder: '@angular/build:karma',
              options: {
                polyfills: ['zone.js', 'zone.js/testing'],
                tsConfig: 'tsconfig.spec.json',
                styles: ['src/styles.css'],
              },
            },
          },
        },
      },
    },
    null,
    2,
  )}\n`,
  'tsconfig.json': `${JSON.stringify(
    {
      compilerOptions: {
        strict: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        skipLibCheck: true,
        isolatedModules: true,
        experimentalDecorators: true,
        importHelpers: true,
        target: 'ES2022',
        module: 'preserve',
      },
      angularCompilerOptions: {
        strictInjectionParameters: true,
        strictInputAccessModifiers: true,
        strictTemplates: true,
      },
      files: [],
      references: [
        { path: './tsconfig.app.json' },
        { path: './tsconfig.spec.json' },
      ],
    },
    null,
    2,
  )}\n`,
  'tsconfig.app.json': `${JSON.stringify(
    {
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: './out-tsc/app',
        types: [],
      },
      include: ['src/**/*.d.ts'],
      files: ['src/main.ts'],
    },
    null,
    2,
  )}\n`,
  'tsconfig.spec.json': `${JSON.stringify(
    {
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: './out-tsc/spec',
        types: ['jasmine'],
      },
      include: ['src/**/*.d.ts', 'src/**/*.spec.ts'],
    },
    null,
    2,
  )}\n`,
  'src/index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>SDCoreJS Angular Golden</title>
    <base href="/">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
`,
  'src/styles.css': `body { font-family: system-ui, sans-serif; margin: 2rem; }\n`,
  'src/main.ts': `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((error: unknown) => console.error(error));
`,
  'src/app/app.config.ts': `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
`,
  'src/app/app.routes.ts': `import { Routes } from '@angular/router';
import { App } from './app';

export const routes: Routes = [
  { path: 'product/create', component: App },
  { path: 'product/detail/:id', component: App },
  { path: 'product/update/:id', component: App },
  { path: '**', redirectTo: 'product/create' },
];
`,
  'src/app/app.ts': `import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export type ScreenState = 'CREATE' | 'UPDATE' | 'DETAIL';
export type RouteParams = Record<string, string | undefined>;

export function resolveRouteId(params: RouteParams | undefined): string {
  return params?.['id'] ?? '';
}

export function backSegments(state: ScreenState): readonly string[] {
  return state === 'CREATE' ? ['../'] : ['../../'];
}

function createLineItem(tempId: string) {
  return new FormGroup({
    id: new FormControl<string | null>(null),
    tempId: new FormControl(tempId, { nonNullable: true }),
    name: new FormControl('', { nonNullable: true }),
  });
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly state = signal<ScreenState>('CREATE');
  readonly pageTitle = computed(() => {
    if (this.state() === 'CREATE') return 'Create product';
    return this.state() === 'DETAIL' ? 'Product details' : 'Update product';
  });
  readonly lineItems = new FormArray([
    createLineItem('draft-1'),
    createLineItem('draft-2'),
  ]);
  readonly form = new FormGroup({ lineItems: this.lineItems });
  readonly lineItemsRevision = signal(0);
  readonly lineItemRows = computed(() => {
    this.lineItemsRevision();
    return this.lineItems.controls.map((control, index) => ({
      rowKey:
        control.get('id')?.value ??
        control.get('tempId')?.value ??
        String(index),
      formGroup: control,
      index,
    }));
  });

  setState(state: ScreenState): void {
    this.state.set(state);
  }

  setPersistedLineId(index: number, id: string): void {
    this.lineItems.at(index).controls.id.setValue(id);
    this.lineItemsRevision.update((revision) => revision + 1);
  }
}
`,
  'src/app/app.html': `<main>
  <h1>{{ pageTitle() }}</h1>

  @if (state() === 'DETAIL') {
    <p data-testid="mode">Read-only detail</p>
  } @else {
    <form [formGroup]="form">
      <div formArrayName="lineItems">
        @for (row of lineItemRows(); track row.rowKey) {
          <div [formGroupName]="row.index">
            <label>
              Item name
              <input formControlName="name">
            </label>
          </div>
        }
      </div>
    </form>
  }
</main>
`,
  'src/app/app.spec.ts': `import { TestBed } from '@angular/core/testing';
import { App, backSegments, resolveRouteId } from './app';

describe('generated Angular golden app', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('renders valid control-flow template and computed titles', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Create product');
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(2);

    fixture.componentInstance.setState('DETAIL');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Product details');
    expect(fixture.nativeElement.querySelector('[data-testid="mode"]')).not.toBeNull();
  });

  it('uses route-id fallback and state-specific back segments', () => {
    expect(resolveRouteId({ id: 'p-123' })).toBe('p-123');
    expect(resolveRouteId({})).toBe('');
    expect(backSegments('CREATE')).toEqual(['../']);
    expect(backSegments('UPDATE')).toEqual(['../../']);
  });

  it('uses tempId until a persisted id exists', () => {
    const app = TestBed.createComponent(App).componentInstance;
    expect(app.lineItemRows()[0].rowKey).toBe('draft-1');
    app.setPersistedLineId(0, 'line-42');
    expect(app.lineItemRows()[0].rowKey).toBe('line-42');
  });
});
`,
  'scripts/validate-template.mjs': `import { parseTemplate } from '@angular/compiler';
import { readFile } from 'node:fs/promises';

const file = new URL('../src/app/app.html', import.meta.url);
const source = await readFile(file, 'utf8');
const parsed = parseTemplate(source, file.pathname, {
  preserveWhitespaces: false,
  enableBlockSyntax: true,
});
if (parsed.errors?.length) {
  console.error(parsed.errors.map((error) => error.toString()).join('\\n'));
  process.exitCode = 1;
} else {
  console.log('Angular template parser: valid');
}
`,
  'scripts/lint.mjs': `import { readFile } from 'node:fs/promises';

const component = await readFile(new URL('../src/app/app.ts', import.meta.url), 'utf8');
const template = await readFile(new URL('../src/app/app.html', import.meta.url), 'utf8');
const errors = [];
if (!component.includes('ChangeDetectionStrategy.OnPush')) errors.push('OnPush is required');
if (/\\bany\\b/u.test(component)) errors.push('explicit any is forbidden');
if (component.includes('<localized text>') || template.includes('<localized text>')) {
  errors.push('unresolved localization placeholder');
}
if (/\\{\\{\\s*(?:get|build|has|is)[A-Z][\\w$]*\\(/u.test(template)) {
  errors.push('method calls in interpolation are forbidden');
}
if (!template.includes('@if') || !template.includes('@for')) {
  errors.push('golden template must exercise Angular control flow');
}
if (errors.length) {
  console.error(errors.join('\\n'));
  process.exitCode = 1;
} else {
  console.log('Angular golden policy lint: valid');
}
`,
};

export async function generateAngularGoldenProject({ output, outputRoot, force = false }) {
  const resolvedOutput = path.resolve(output);
  const resolvedRoot = path.resolve(outputRoot);
  if (
    resolvedOutput === resolvedRoot ||
    !resolvedOutput.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new Error('output must be a child of outputRoot');
  }
  if (force) {
    throw new Error('force overwrite is intentionally unsupported for the golden generator');
  }
  for (const [relativeFile, content] of Object.entries(files)) {
    const target = path.join(resolvedOutput, relativeFile);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, { encoding: 'utf8', flag: 'wx' });
  }
  return {
    project_root: resolvedOutput,
    files: Object.keys(files).sort(),
    angular_version: '20.3.27',
    fixture_kind: 'generated-real-angular',
  };
}
