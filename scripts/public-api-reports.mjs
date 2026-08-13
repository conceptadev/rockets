import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { readPublicPackageManifests } from './public-package-manifests.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportsPath = join(repositoryRoot, 'etc', 'public-api-reports.json');
const update = process.argv.includes('--update');
const allowedConditions = ['types', 'import', 'require', 'default'];

function resolveTypesTarget(value) {
  if (typeof value === 'string') return value.endsWith('.d.ts') ? value : null;
  if (value === null || typeof value !== 'object') return null;

  for (const condition of allowedConditions) {
    const target = resolveTypesTarget(value[condition]);
    if (target !== null) return target;
  }
  return null;
}

function entryPoints() {
  const entries = [];

  for (const manifest of readPublicPackageManifests(repositoryRoot, {
    namePrefix: '@concepta/',
  })) {
    const packageRoot = join(
      repositoryRoot,
      'packages',
      manifest.repository.directory.replace(/^packages\//, ''),
    );

    for (const [subpath, conditions] of Object.entries(
      manifest.exports ?? {},
    )) {
      if (subpath === './package.json') continue;
      const target = resolveTypesTarget(conditions);
      if (target === null) continue;
      const filePath = resolve(packageRoot, target);
      const entryPoint =
        subpath === '.'
          ? manifest.name
          : `${manifest.name}/${subpath.slice(2)}`;
      entries.push({ entryPoint, filePath });
    }
  }

  return entries.sort((left, right) =>
    left.entryPoint.localeCompare(right.entryPoint),
  );
}

function normalizeSignature(value) {
  return value
    .replaceAll(repositoryRoot, '<repo>')
    .replaceAll('\\', '/')
    .replace(
      /, \{ with: \{ ["']resolution-mode["']: ["'](?:import|require)["'] \} \}/g,
      '',
    )
    .replace(/[ \t]+$/gm, '')
    .trim();
}

function declarationKind(symbol) {
  const resolved =
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  const flags = resolved.flags;

  if (flags & ts.SymbolFlags.Class) return 'class';
  if (flags & ts.SymbolFlags.Interface) return 'interface';
  if (flags & ts.SymbolFlags.TypeAlias) return 'type';
  if (flags & ts.SymbolFlags.Enum) return 'enum';
  if (flags & ts.SymbolFlags.Function) return 'function';
  if (flags & ts.SymbolFlags.NamespaceModule) return 'namespace';
  if (
    flags &
    (ts.SymbolFlags.BlockScopedVariable | ts.SymbolFlags.FunctionScopedVariable)
  ) {
    return 'value';
  }
  return 'symbol';
}

function declarationSignature(symbol) {
  const resolved =
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  const declarations = resolved.declarations ?? [];
  if (declarations.length > 0) {
    return normalizeSignature(
      declarations
        .map((declaration) =>
          printer.printNode(
            ts.EmitHint.Unspecified,
            declaration,
            declaration.getSourceFile(),
          ),
        )
        .join('\n'),
    );
  }

  const location = resolved.valueDeclaration;
  if (location === undefined) return '';
  return normalizeSignature(
    checker.typeToString(
      checker.getTypeOfSymbolAtLocation(resolved, location),
      location,
      ts.TypeFormatFlags.NoTruncation |
        ts.TypeFormatFlags.UseFullyQualifiedType,
    ),
  );
}

function isDeprecated(symbol) {
  const resolved =
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  const declarations = [
    ...(symbol.declarations ?? []),
    ...(resolved.declarations ?? []),
  ];
  return declarations.some(
    (declaration) => ts.getJSDocDeprecatedTag(declaration) !== undefined,
  );
}

const entries = entryPoints();
const missing = entries.filter(({ filePath }) => !existsSync(filePath));
if (missing.length > 0) {
  console.error(
    'Public API report generation requires a fresh build. Missing:',
  );
  for (const { entryPoint, filePath } of missing) {
    console.error(`- ${entryPoint}: ${relative(repositoryRoot, filePath)}`);
  }
  process.exit(1);
}

const compilerOptions = {
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ES2022,
  skipLibCheck: true,
  noEmit: true,
};
const program = ts.createProgram(
  entries.map(({ filePath }) => filePath),
  compilerOptions,
);
const checker = program.getTypeChecker();
const printer = ts.createPrinter({
  removeComments: true,
  newLine: ts.NewLineKind.LineFeed,
});
const reports = {};

for (const { entryPoint, filePath } of entries) {
  const sourceFile = program.getSourceFile(filePath);
  const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
  if (sourceFile === undefined || moduleSymbol === undefined) {
    throw new Error(`Unable to inspect declarations for ${entryPoint}.`);
  }

  reports[entryPoint] = checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol) => ({
      name: symbol.name,
      kind: declarationKind(symbol),
      signature: declarationSignature(symbol),
      ...(isDeprecated(symbol) ? { deprecated: true } : {}),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

const serialized = `${JSON.stringify(
  {
    formatVersion: 1,
    typescriptVersion: ts.version,
    entryPoints: reports,
  },
  null,
  2,
)}\n`;

if (update) {
  writeFileSync(reportsPath, serialized);
  console.log(
    `Updated ${relative(repositoryRoot, reportsPath)} for ${
      entries.length
    } entry points.`,
  );
} else {
  if (!existsSync(reportsPath)) {
    console.error(
      `Public API report is missing. Run \`yarn api:report:update\` after a build.`,
    );
    process.exit(1);
  }
  const expected = readFileSync(reportsPath, 'utf8');
  if (expected !== serialized) {
    console.error(
      'Public API declarations changed. Review the change, update the API policy/migration notes, then run `yarn api:report:update`.',
    );
    process.exit(1);
  }
  console.log(
    `Verified public API reports for ${entries.length} entry points.`,
  );
}
