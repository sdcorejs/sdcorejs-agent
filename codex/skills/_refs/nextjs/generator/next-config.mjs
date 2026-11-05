// Canonical config producer shared by the maintained recipe and golden projects.
export function renderNextConfig(profile = 'basic') {
  if (!['basic', 'i18n', 'contact'].includes(profile)) throw new TypeError('unsupported Next.js profile');
  const intl = profile === 'i18n';
  return `import type { NextConfig } from 'next';
${intl ? "import createNextIntlPlugin from 'next-intl/plugin';\n" : ''}
const config: NextConfig = {
  poweredByHeader: false,
};

export default ${intl ? "createNextIntlPlugin('./src/i18n/request.ts')(config)" : 'config'};
`;
}
