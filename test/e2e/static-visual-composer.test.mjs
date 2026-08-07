import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  formatCopiedResponse,
  renderMarkdownFallback,
  renderStaticVisualScreen,
  validateVisualScreen,
} from '../../_refs/sdlc/static-visual-composer.mjs';
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  validateVisualScreen as validateScreenModel,
} from '../../_refs/sdlc/visual-companion/screen.mjs';
import { MESSAGE_KEYS } from '../../_refs/sdlc/visual-companion/renderer.mjs';

const schemaUrl = new URL('../../_refs/sdlc/visual-screen.schema.json', import.meta.url);
const composerUrl = new URL('../../_refs/sdlc/static-visual-composer.mjs', import.meta.url);
const option = (id, label) => ({
  id,
  label,
  summary: label + ' summary.',
  best_when: 'Always.',
  tradeoff: 'None.',
  preview_asset: id + '.svg',
});
const screen = {
  schema_version: 1,
  screen_id: 'execution-mode',
  type: 'single_select',
  question: 'Choose how to run independent work.',
  criteria: [],
  options: [
    { id: 'sequential', label: 'Sequential', summary: 'One unit at a time.', best_when: 'Work depends on prior results.', tradeoff: 'Takes longer.', preview_asset: 'sequential.svg' },
    { id: 'parallel', label: 'Parallel', summary: 'Independent units together.', best_when: 'Paths and resources are disjoint.', tradeoff: 'Requires integration.', preview_asset: 'parallel.svg' },
  ],
  recommendation: 'sequential',
  fallback_prompt: 'Reply 1 for Sequential or 2 for Parallel.',
};
const vietnameseRuntime = {
  runtime_server: false,
  event_bridge: false,
  locale: 'vi',
  messages: {
    criteria: 'Tiêu chí',
    recommendation: 'Khuyến nghị',
    option: 'Lựa chọn',
    best_when: 'Phù hợp nhất khi',
    tradeoff: 'Đánh đổi',
    preview_metadata: 'Dữ liệu xem trước',
    preview_label: 'Xem trước',
    selection_help: 'Dùng Tab để chọn; dùng phím số 1-{count} làm phím tắt.',
    visual_decision_options: 'Các lựa chọn trực quan',
    feedback_optional: 'Phản hồi (không bắt buộc)',
    feedback_aria: 'Phản hồi cho quyết định trực quan này',
    copy_response: 'Sao chép phản hồi',
    copy_response_aria: 'Sao chép phản hồi có cấu trúc',
    selectable_response_aria: 'Phản hồi có cấu trúc có thể chọn',
    markdown_fallback: 'Phương án Markdown',
    selection_updated: 'Đã cập nhật lựa chọn.',
    copy_unavailable: 'Không thể sao chép. Phản hồi có thể chọn được hiển thị bên dưới.',
    response_copied: 'Đã sao chép phản hồi.',
    submit_selection: 'Gửi lựa chọn',
    submit_selection_aria: 'Gửi lựa chọn trực quan đã chọn',
    selection_submitted: 'Đã gửi lựa chọn cho tác nhân.',
    select_before_submit: 'Hãy chọn một phương án trước khi gửi.',
    status_connecting: 'Đang kết nối...',
    status_connected: 'Đã kết nối',
    status_reconnecting: 'Đang kết nối lại...',
    status_paused: 'Đã tạm dừng',
    paused_title: 'Trình đồng hành trực quan đã tạm dừng',
    paused_body: 'Trình đồng hành đã ngừng phản hồi. Hãy yêu cầu tác nhân khởi động lại.',
    waiting_title: 'Đang chờ quyết định trực quan tiếp theo',
    waiting_body: 'Cuộc hội thoại đã quay lại dạng văn bản.',
    supporting_feedback_note: 'Lựa chọn của bạn là phản hồi thiết kế. Việc phê duyệt vẫn diễn ra trong hội thoại.',
  },
};

test('the static surface delegates to the one screen model instead of copying it', async () => {
  const source = await readFile(composerUrl, 'utf8');
  assert.match(source, /from '\.\/visual-companion\/screen\.mjs'/);
  assert.match(source, /from '\.\/visual-companion\/renderer\.mjs'/);
  assert.doesNotMatch(
    source,
    /^const (?:SCREEN_KEYS|OPTION_KEYS|TYPES)\s*=/m,
    'the static surface must not redeclare the screen schema'
  );
  assert.doesNotMatch(
    source,
    /^const DEFAULT_MESSAGES\s*=/m,
    'the static surface must not redeclare the localized message bundle'
  );
  assert.deepEqual(validateVisualScreen(screen), validateScreenModel(screen));
  const broken = { ...screen, recommendation: 'missing-option' };
  assert.deepEqual(validateVisualScreen(broken), validateScreenModel(broken));
  assert.ok(MESSAGE_KEYS.has('supporting_feedback_note'));
});

test('visual schema and validator require a bounded unique option screen shape', async () => {
  const schema = JSON.parse(await readFile(schemaUrl, 'utf8'));
  for (const key of ['schema_version', 'screen_id', 'type', 'question', 'criteria', 'options', 'recommendation', 'fallback_prompt']) assert.ok(schema.required.includes(key));
  assert.ok(Array.isArray(schema.properties.type.enum));
  assert.deepEqual(schema.properties.type.enum.sort(), ['comparison', 'multi_select', 'single_select', 'wireframe']);
  assert.equal(schema.properties.options.minItems, MIN_OPTIONS);
  assert.equal(schema.properties.options.maxItems, MAX_OPTIONS);
  assert.equal(MIN_OPTIONS, 2);
  assert.equal(MAX_OPTIONS, 4);
  assert.ok(schema.$defs.option.properties.preview, 'the published schema carries the preview contract');

  assert.deepEqual(validateVisualScreen(screen, schema), []);
  const four = {
    ...screen,
    options: [...screen.options, option('hybrid', 'Hybrid'), option('staged', 'Staged')],
  };
  assert.deepEqual(validateVisualScreen(four, schema), [], 'four options are within the bound');
  const five = { ...four, options: [...four.options, option('manual', 'Manual')] };
  assert.match(validateVisualScreen(five, schema).join('\n'), /2 to 4 options/);
  assert.match(validateVisualScreen({ ...screen, options: [screen.options[0]] }, schema).join('\n'), /2 to 4 options/);
  assert.ok(validateVisualScreen({ ...screen, options: [...screen.options, { ...screen.options[0] }] }, schema).length > 0);
  assert.ok(validateVisualScreen({ ...screen, options: [{ ...screen.options[0], id: 'bad id' }, screen.options[1] ] }, schema).length > 0);
  assert.ok(validateVisualScreen({ ...screen, recommendation: 'missing-option' }, schema).length > 0);
  assert.ok(validateVisualScreen({ ...screen, html: '<button>unsafe</button>' }, schema).length > 0);
});

test('static rendering is deterministic, keyboard-accessible, and network-free', () => {
  const first = renderStaticVisualScreen(screen, { runtime_server: false, event_bridge: false });
  const second = renderStaticVisualScreen(screen, { runtime_server: false, event_bridge: false });
  assert.equal(first, second);
  assert.match(first, /Content-Security-Policy/i);
  assert.match(first, /default-src 'none'/i);
  assert.match(first, /aria-label=/i);
  assert.match(first, /role="radiogroup"/i);
  assert.match(first, /<li role="none"><button[^>]+role="radio"/i);
  assert.match(first, /(?:keydown|keyup|keypress)/i);
  assert.match(first, /copy|copied|feedback/i);
  assert.match(first, /Reply 1 for Sequential or 2 for Parallel\./);
  assert.doesNotMatch(first, /https?:\/\/|telemetry|<script\b[^>]*src=/i);
  assert.equal((first.match(/<script\b/gi) ?? []).length, 1, 'one fixed inline script is permitted for keyboard/copy feedback');
  assert.throws(
    () => renderStaticVisualScreen(screen, { runtime_server: true }),
    /Visual Companion runtime/,
    'the static surface refuses to pose as a live session'
  );
  assert.throws(() => renderStaticVisualScreen(screen, { event_bridge: true }), /Visual Companion runtime/);
});

test('shared preview blocks render on the static surface without a network reference', () => {
  const withPreviews = {
    ...screen,
    options: [
      {
        ...screen.options[0],
        preview: {
          kind: 'wireframe',
          caption: 'Sidebar layout',
          regions: [
            { label: 'Nav', area: 'sidebar', span: 3 },
            { label: 'Content', area: 'main', span: 9 },
          ],
        },
      },
      {
        ...screen.options[1],
        preview: {
          kind: 'image',
          asset: 'parallel.png',
          alt: 'Two lanes running side by side',
          caption: 'Parallel lanes',
        },
      },
    ],
  };
  const html = renderStaticVisualScreen(withPreviews, {});
  assert.match(html, /data-preview-kind="wireframe"/);
  assert.match(html, /class="vc-region vc-area-sidebar"/);
  assert.match(html, /Two lanes running side by side/);
  assert.doesNotMatch(html, /<img\b/i, 'a standalone file has no asset route, so an image degrades to its description');
  const markdown = renderMarkdownFallback(withPreviews, {});
  assert.match(markdown, /Preview: Sidebar layout/);
  assert.match(markdown, /Preview: Parallel lanes/);
  assert.throws(
    () => renderStaticVisualScreen({
      ...screen,
      options: [
        { ...screen.options[0], preview: { kind: 'svg', svg: '<svg><script>alert(1)</script></svg>' } },
        screen.options[1],
      ],
    }, {}),
    /Invalid visual screen/,
    'an unsafe preview is rejected at render time rather than sanitized'
  );
});

test('runtime locale localizes HTML, accessibility text, status messages, and Markdown fallback', () => {
  const localizedScreen = {
    ...screen,
    question: 'Chọn cách thực thi công việc độc lập.',
    criteria: ['Tốc độ'],
    options: [
      {
        ...screen.options[0],
        label: 'Tuần tự',
        summary: 'Thực hiện từng đơn vị.',
        best_when: 'Công việc phụ thuộc kết quả trước.',
        tradeoff: 'Mất nhiều thời gian hơn.',
      },
      {
        ...screen.options[1],
        label: 'Song song',
        summary: 'Thực hiện các đơn vị độc lập cùng lúc.',
        best_when: 'Đường dẫn và tài nguyên không giao nhau.',
        tradeoff: 'Cần bước tích hợp.',
      },
    ],
    fallback_prompt: 'Trả lời 1 cho Tuần tự hoặc 2 cho Song song.',
  };
  const html = renderStaticVisualScreen(localizedScreen, vietnameseRuntime);
  const markdown = renderMarkdownFallback(localizedScreen, vietnameseRuntime);
  assert.match(html, /<html lang="vi">/);
  assert.match(html, /<strong>Tiêu chí:<\/strong>/);
  assert.match(html, /<p>Khuyến nghị: <strong>sequential<\/strong><\/p>/);
  assert.match(html, /aria-label="Các lựa chọn trực quan"/);
  assert.match(html, /data-message-selection-updated="Đã cập nhật lựa chọn\."/);
  assert.match(html, /data-message-response-copied="Đã sao chép phản hồi\."/);
  assert.match(html, /Việc phê duyệt vẫn diễn ra trong hội thoại\./);
  assert.match(markdown, /Tiêu chí:/);
  assert.match(markdown, /Phù hợp nhất khi:/);
  assert.match(markdown, /Đánh đổi:/);
  assert.match(markdown, /Khuyến nghị: sequential/);
  assert.match(markdown, /Trả lời 1 cho Tuần tự hoặc 2 cho Song song\./);
  assert.ok(html.includes(markdown), 'rendered HTML contains the same localized Markdown fallback');
  assert.doesNotMatch(html, />Criteria:<|>Recommendation:|>Copy response|Choose how to run/);
  assert.throws(
    () => renderStaticVisualScreen(screen, { locale: 'vi' }),
    /complete localized message bundle/
  );
  assert.throws(
    () => renderStaticVisualScreen(screen, { ...vietnameseRuntime, locale: 'invalid locale' }),
    /runtime\.locale/
  );
});

test('renderers escape malicious fields and preserve Markdown fallback parity without a runtime server', () => {
  const malicious = { ...screen, screen_id: 'safe', recommendation: 'safe', question: '<img src=x onerror=alert(1)>', options: [{ ...screen.options[0], id: 'safe', label: '<script>alert(1)</script>', summary: '" onmouseover="alert(1)', preview_asset: '"><img src=x onerror=alert(2)>' }, screen.options[1]] };
  const maliciousRuntime = {
    ...vietnameseRuntime,
    messages: {
      ...vietnameseRuntime.messages,
      copy_response: '<img src=x onerror=alert(3)>',
      selection_updated: '"><script>alert(4)</script>',
    },
  };
  const html = renderStaticVisualScreen(malicious, maliciousRuntime);
  const markdown = renderMarkdownFallback(malicious, maliciousRuntime);
  assert.doesNotMatch(html, /<img|<script>alert|onerror=/i);
  assert.match(html, /&lt;img|&lt;script|&quot;/i);
  assert.doesNotMatch(markdown, /<img|<script/i);
  assert.match(markdown, /&lt;img|&lt;script/i);
  assert.match(markdown, /1\. .*safe/i);
  assert.match(markdown, /2\. /);
  assert.deepEqual(formatCopiedResponse({ screen: malicious, selected_option_ids: ['safe'], feedback: 'looks good' }), { screen_id: 'safe', selected_option_ids: ['safe'], feedback: 'looks good' });
  assert.throws(() => formatCopiedResponse({ screen: malicious, selected_option_ids: ['missing'], feedback: '' }), /belong to the screen/);
  assert.deepEqual(formatCopiedResponse({ screen: { ...malicious, type: 'multi_select' }, selected_option_ids: ['safe', 'parallel'], feedback: 'compare both' }), { screen_id: 'safe', selected_option_ids: ['safe', 'parallel'], feedback: 'compare both' });
});
