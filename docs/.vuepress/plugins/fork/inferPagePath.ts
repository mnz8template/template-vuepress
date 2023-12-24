import { ensureLeadingSlash, resolveLocalePath } from '@vuepress/shared';
import type { App } from 'vuepress';

/**
 * Infer page path according to file path
 */
export function inferPagePath({ app, filePathRelative }: { app: App; filePathRelative: string | null }) {
  if (!filePathRelative) {
    return {
      pathInferred: null,
      pathLocale: '/',
    };
  }

  // infer page route path from file path
  // foo/bar.md -> /foo/bar.html
  const pathInferred = ensureLeadingSlash(filePathRelative)
    .replace(/\.md$/, '.html')
    .replace(/\/(README|index).html$/i, '/');

  // resolve page locale path
  const pathLocale = resolveLocalePath(app.siteData.locales, pathInferred);

  return {
    pathInferred,
    pathLocale,
  };
}
