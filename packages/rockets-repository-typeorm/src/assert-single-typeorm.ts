import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

/**
 * Guard against more than one resolved copy of `typeorm` in the process.
 *
 * `@nestjs/typeorm` uses the `DataSource` **class object itself** as the
 * default DI token (`getDataSourceToken()` returns `typeorm_1.DataSource`).
 * Two copies of `typeorm` therefore produce two different tokens: the
 * provider is registered under one and looked up under the other, and
 * Nest reports
 *
 * ```text
 * Nest could not find DataSource element
 * ```
 *
 * which says nothing about the cause. It typically appears right after an
 * unrelated install pulled its own nested `typeorm`.
 *
 * Every package in the chain already declares `typeorm` as a *peer*
 * dependency — `@concepta/rockets-repository-typeorm`,
 * `@concepta/nestjs-repository-typeorm` and `@nestjs/typeorm` — so a
 * package manager normally dedupes to one copy and warns on conflict.
 * This is the backstop for when it does not.
 */

/** Matches the package root of any `.../node_modules/typeorm` module. */
const TYPEORM_ROOT = /^(.*[\\/]node_modules[\\/]typeorm)[\\/]/;

/**
 * Package roots of every `typeorm` copy in the CommonJS module cache.
 *
 * Diagnostic detail only — it names the paths in the error message when
 * it can. Under a native-ESM loader there is no `require.cache` to read
 * and this returns an empty list; the identity check below does not
 * depend on it.
 */
export function resolvedTypeOrmRoots(): string[] {
  const cache =
    typeof require === 'function' && typeof require.cache === 'object'
      ? require.cache
      : undefined;
  if (cache === undefined) return [];

  const roots = new Set<string>();
  for (const filename of Object.keys(cache)) {
    const match = TYPEORM_ROOT.exec(filename);
    if (match?.[1] !== undefined) roots.add(match[1]);
  }
  return [...roots].sort();
}

/**
 * Whether the `DataSource` this package resolved is the same class
 * `@nestjs/typeorm` uses as its default DI token.
 *
 * A mismatch IS the duplicate-copy failure, observed directly rather
 * than inferred from the filesystem.
 */
export function hasSingleTypeOrmInstance(): boolean {
  return getDataSourceToken() === DataSource;
}

/**
 * Throws an actionable error when two copies of `typeorm` are in play.
 *
 * Called by `defineTypeOrmRepository().forRoot()` — the moment the
 * DataSource is configured, which is the last point before the opaque
 * Nest error. Safe to call directly from an app's bootstrap to fail
 * earlier.
 */
export function assertSingleTypeOrmInstance(): void {
  if (hasSingleTypeOrmInstance()) return;

  const roots = resolvedTypeOrmRoots();
  const paths =
    roots.length > 1
      ? `\n\nCopies found:\n${roots.map((root) => `  - ${root}`).join('\n')}`
      : '';

  throw new Error(
    `[@concepta/rockets-repository-typeorm] Two copies of \`typeorm\` are ` +
      `loaded in this process.\n\n` +
      `\`@nestjs/typeorm\` uses the \`DataSource\` class itself as its DI ` +
      `token, so a second copy registers the provider under one token and ` +
      `looks it up under another. Nest reports this as ` +
      `"could not find DataSource element" with no further detail.` +
      paths +
      `\n\nDeduplicate to a single copy — \`yarn dedupe typeorm\`, an npm ` +
      `\`overrides\` entry, or a pnpm \`resolutions\` entry — then find ` +
      `which dependency pulled the nested copy with \`yarn why typeorm\`.`,
  );
}
