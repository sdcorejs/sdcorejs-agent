// Pure helper for the task-breakdown check CLI: per-source guidance for sources that
// could not be read. The model picks the kind id; the domain never decides the kind,
// because the same host can be a tracker in one project and a wiki in another.
import { redactValue } from './safety.mjs';

/** Source kind ids, in the order of the table in `_refs/product/source-connectors.md`. */
export const SOURCE_KINDS = Object.freeze(['issue-tracker', 'wiki', 'design-tool', 'api-spec', 'login-gated', 'file', 'unknown']);

const GUIDANCE = Object.freeze({
  en: Object.freeze({
    'issue-tracker': 'Configure a read connector (an MCP server or the agent\'s built-in integration) for the tracker project; grant write access only if tracker writes are wanted. Otherwise export the board or filter as CSV or JSON into the repository, or paste the story text.',
    wiki: 'Configure a read connector for the space, or export the page as Markdown, HTML or PDF into the repository, or paste the relevant section.',
    'design-tool': 'Configure a read connector for the design file, or export the frames as PNG with their node links and paste the annotations.',
    'api-spec': 'Download the machine-readable document (for example /v3/api-docs) with a read-only GET into a scratch folder, filter it by path, operation id or schema, and record the environment and date.',
    'login-gated': 'Export the page, or share a link you can open without passing credentials to the agent. Never paste a token, cookie or password into the conversation.',
    file: 'Place the file in the repository or attach it to the conversation so it can be read as a repository file.',
    unknown: 'Configure a read connector for this system, export the content into the repository, or paste the relevant part.',
  }),
  vi: Object.freeze({
    'issue-tracker': 'Cấu hình connector đọc (MCP server hoặc tích hợp sẵn của agent) cho project trên tracker; chỉ cấp quyền ghi khi cần ghi tracker. Nếu không, export board hoặc filter ra CSV hay JSON vào repo, hoặc dán nội dung story.',
    wiki: 'Cấu hình connector đọc cho space, hoặc export trang ra Markdown, HTML hay PDF vào repo, hoặc dán phần liên quan.',
    'design-tool': 'Cấu hình connector đọc cho file thiết kế, hoặc export frame ra PNG kèm link node và dán phần chú thích.',
    'api-spec': 'Tải tài liệu dạng máy đọc được (ví dụ /v3/api-docs) bằng một lệnh GET chỉ đọc vào thư mục tạm, lọc theo path, operation id hoặc schema, và ghi lại môi trường cùng ngày tải.',
    'login-gated': 'Export trang, hoặc chia sẻ link mở được mà không phải đưa thông tin đăng nhập cho agent. Không dán token, cookie hay mật khẩu vào cuộc trò chuyện.',
    file: 'Đặt file vào repo hoặc đính kèm vào cuộc trò chuyện để đọc như một file trong repo.',
    unknown: 'Cấu hình connector đọc cho hệ thống này, export nội dung vào repo, hoặc dán phần liên quan.',
  }),
});

const LABELS = Object.freeze({
  en: Object.freeze({ domain: 'Domain', kind: 'Kind', sources: 'Unreadable sources', reason: 'Reason', guidance: 'What to do', no_link: '(no link)' }),
  vi: Object.freeze({ domain: 'Domain', kind: 'Loại nguồn', sources: 'Nguồn chưa đọc được', reason: 'Lý do', guidance: 'Cách xử lý', no_link: '(không có link)' }),
});

const KIND_LABELS = Object.freeze({
  en: Object.freeze({ 'issue-tracker': 'Issue tracker', wiki: 'Wiki or document space', 'design-tool': 'Design tool', 'api-spec': 'API specification', 'login-gated': 'Login-gated portal', file: 'File', unknown: 'Unknown' }),
  vi: Object.freeze({ 'issue-tracker': 'Issue tracker', wiki: 'Wiki hoặc kho tài liệu', 'design-tool': 'Công cụ thiết kế', 'api-spec': 'Đặc tả API', 'login-gated': 'Trang cần đăng nhập', file: 'File', unknown: 'Chưa rõ' }),
});

/** Host of an http(s) link, lowercased; null when the reference is not such a link. */
function domainOf(ref) {
  try {
    const url = new URL(ref);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.hostname.toLowerCase() : null;
  } catch {
    return null;
  }
}

const cell = (value) => String(value).replace(/\r?\n/gu, ' ').replaceAll('|', '\\|');
const byText = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

/**
 * Validate unreadable sources, redact them and group them by (domain, kind).
 * Returns `{ valid, errors, groups, table, redactions }`; findings never carry values.
 */
export function sourceGuidance({ sources, language = 'en' } = {}) {
  const errors = [];
  if (!Object.hasOwn(GUIDANCE, language)) errors.push({ code: 'LANGUAGE_INVALID', path: 'language', message: 'language must be vi or en' });
  if (!Array.isArray(sources) || sources.length === 0) errors.push({ code: 'SOURCES_REQUIRED', path: 'sources', message: 'list at least one source that could not be read' });
  (Array.isArray(sources) ? sources : []).forEach((source, index) => {
    if (typeof source?.ref !== 'string' || source.ref.trim() === '') errors.push({ code: 'SOURCE_REF_REQUIRED', path: `sources[${index}].ref`, message: 'each source needs its link or name' });
    if (!SOURCE_KINDS.includes(source?.kind)) errors.push({ code: 'SOURCE_KIND_UNKNOWN', path: `sources[${index}].kind`, message: `kind must be one of ${SOURCE_KINDS.join(', ')}` });
    if (source?.reason !== undefined && typeof source.reason !== 'string') errors.push({ code: 'SOURCE_REASON_INVALID', path: `sources[${index}].reason`, message: 'reason must be text' });
  });
  if (errors.length > 0) return { valid: false, errors, groups: [], table: null, redactions: [] };

  const redactions = [];
  const groups = new Map();
  sources.forEach((source, index) => {
    const { value, findings } = redactValue({ ref: source.ref.trim(), reason: (source.reason ?? '').trim() }, { source: `sources[${index}]` });
    redactions.push(...findings);
    const domain = domainOf(source.ref.trim());
    const key = `${domain ?? ''}\u0000${source.kind}`;
    if (!groups.has(key)) groups.set(key, { domain, kind: source.kind, refs: new Set(), reasons: new Set() });
    groups.get(key).refs.add(value.ref);
    if (value.reason) groups.get(key).reasons.add(value.reason);
  });

  const ordered = [...groups.values()]
    .sort((left, right) => (left.domain === null) - (right.domain === null) || byText(left.domain ?? '', right.domain ?? '')
      || SOURCE_KINDS.indexOf(left.kind) - SOURCE_KINDS.indexOf(right.kind))
    .map(({ domain, kind, refs, reasons }) => ({
      domain, kind, refs: [...refs].sort(byText), reasons: [...reasons].sort(byText), guidance: GUIDANCE[language][kind],
    }));
  const labels = LABELS[language];
  const rows = ordered.map(({ domain, kind, refs, reasons, guidance }) =>
    `| ${[domain ?? labels.no_link, KIND_LABELS[language][kind], refs.join(', '), reasons.join('; '), guidance].map(cell).join(' | ')} |`);
  const table = [`| ${[labels.domain, labels.kind, labels.sources, labels.reason, labels.guidance].join(' | ')} |`, '|---|---|---|---|---|', ...rows].join('\n');
  return { valid: true, errors: [], groups: ordered, table, redactions };
}
