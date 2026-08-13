import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { readPublicPackageManifests } from './public-package-manifests.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const defaultRepositoryRoot = resolve(dirname(scriptPath), '..');
const require = createRequire(import.meta.url);
const allowedTypeConditions = ['types', 'import', 'require', 'default'];
const allowedRuntimeConditions = ['require', 'default'];

/**
 * Byte-stable ordering for the committed report. `localeCompare()` follows the
 * host's default locale, and names already in this report reorder under
 * `cs-CZ`, `da-DK`, `tr-TR`, and `et-EE` — which would make the checked-in JSON
 * differ per machine and fail the check for a collation artifact. Code-unit
 * order also avoids depending on the ICU data bundled with a given Node build.
 */
export function compareText(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function resolveExportTarget(value, conditions, accept) {
  if (typeof value === 'string') return accept(value) ? value : null;
  if (value === null || typeof value !== 'object') return null;

  for (const condition of conditions) {
    const target = resolveExportTarget(value[condition], conditions, accept);
    if (target !== null) return target;
  }
  return null;
}

export function discoverEntryPoints(repositoryRoot) {
  const entries = [];

  for (const manifest of readPublicPackageManifests(repositoryRoot, {
    namePrefix: '@concepta/',
  })) {
    const packageRoot = resolve(repositoryRoot, manifest.repository.directory);

    for (const [subpath, conditions] of Object.entries(
      manifest.exports ?? {},
    )) {
      if (subpath === './package.json') continue;

      const typesTarget = resolveExportTarget(
        conditions,
        allowedTypeConditions,
        (target) => target.endsWith('.d.ts'),
      );
      // Fail loudly: a subpath the report cannot inspect is still a supported
      // import path, so silently skipping it would leave it unguarded.
      if (typesTarget === null) {
        throw new Error(
          `${manifest.name} export "${subpath}" has no resolvable .d.ts types condition.`,
        );
      }

      const runtimeTarget = resolveExportTarget(
        conditions,
        allowedRuntimeConditions,
        (target) => !target.endsWith('.d.ts'),
      );
      const entryPoint =
        subpath === '.'
          ? manifest.name
          : `${manifest.name}/${subpath.slice(2)}`;

      entries.push({
        entryPoint,
        packageRoot,
        typesPath: resolve(packageRoot, typesTarget),
        runtimePath:
          runtimeTarget === null ? null : resolve(packageRoot, runtimeTarget),
      });
    }
  }

  return entries.sort((left, right) =>
    compareText(left.entryPoint, right.entryPoint),
  );
}

export function normalizeSignature(value, repositoryRoot) {
  return value
    .replaceAll(repositoryRoot, '<repo>')
    .replaceAll('\\', '/')
    .replace(
      /, \{ with: \{ ["']resolution-mode["']: ["'](?:import|require)["'] \} \}/g,
      '',
    )
    .replace(/import\((["'])(?:\.\.?\/)[^"']+\1\)\./g, '')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

function resolveSymbol(checker, symbol) {
  return symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}

function declarationKind(checker, symbol) {
  const flags = resolveSymbol(checker, symbol).flags;

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

function declarationSignature(checker, printer, symbol, repositoryRoot) {
  const resolved = resolveSymbol(checker, symbol);
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
      repositoryRoot,
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
    repositoryRoot,
  );
}

function isWithin(parent, child) {
  const path = relative(parent, child);
  return path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

function packageDeclarations(symbol, packageRoot) {
  return (symbol.declarations ?? []).filter(
    (declaration) =>
      declaration.parent !== undefined &&
      ts.isSourceFile(declaration.parent) &&
      isWithin(packageRoot, declaration.getSourceFile().fileName),
  );
}

function supportingDeclarationsForEntryPoint({
  checker,
  exportedSymbols,
  packageRoot,
  printer,
  repositoryRoot,
}) {
  const exportedTargets = new Set(
    exportedSymbols.map((symbol) => resolveSymbol(checker, symbol)),
  );
  const references = new Map();

  for (const exportedSymbol of exportedSymbols) {
    const exportedName = exportedSymbol.name;
    const rootSymbol = resolveSymbol(checker, exportedSymbol);
    const visited = new Set();

    const visitSymbol = (symbol) => {
      const resolved = resolveSymbol(checker, symbol);
      if (visited.has(resolved)) return;
      visited.add(resolved);

      for (const declaration of resolved.declarations ?? []) {
        const visitNode = (node) => {
          if (ts.isIdentifier(node)) {
            const referenced = checker.getSymbolAtLocation(node);
            if (referenced !== undefined) {
              const target = resolveSymbol(checker, referenced);
              if (target !== resolved && !exportedTargets.has(target)) {
                const declarations = packageDeclarations(target, packageRoot);
                if (declarations.length > 0) {
                  const owners = references.get(target) ?? new Set();
                  owners.add(exportedName);
                  references.set(target, owners);
                  visitSymbol(target);
                }
              }
            }
          }
          ts.forEachChild(node, visitNode);
        };

        ts.forEachChild(declaration, visitNode);
      }
    };

    visitSymbol(rootSymbol);
  }

  return [...references]
    .map(([symbol, referencedBy]) => ({
      name: symbol.name,
      kind: declarationKind(checker, symbol),
      signature: declarationSignature(checker, printer, symbol, repositoryRoot),
      referencedBy: [...referencedBy].sort(compareText),
    }))
    .sort(
      (left, right) =>
        compareText(left.name, right.name) ||
        compareText(left.signature, right.signature),
    );
}

function runtimeExportNames(runtimePath) {
  if (runtimePath === null) return new Set();
  const loaded = require(runtimePath);
  if (
    (typeof loaded !== 'object' && typeof loaded !== 'function') ||
    loaded === null
  ) {
    return new Set(['default']);
  }
  return new Set(Object.keys(loaded).filter((name) => name !== '__esModule'));
}

export function buildPublicApiReport(entries, repositoryRoot) {
  const compilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    skipLibCheck: true,
    noEmit: true,
  };
  const program = ts.createProgram(
    entries.map(({ typesPath }) => typesPath),
    compilerOptions,
  );
  const checker = program.getTypeChecker();
  const printer = ts.createPrinter({
    removeComments: true,
    newLine: ts.NewLineKind.LineFeed,
  });
  const entryPoints = {};
  const supportingDeclarations = {};

  for (const entry of entries) {
    const sourceFile = program.getSourceFile(entry.typesPath);
    const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
    if (sourceFile === undefined || moduleSymbol === undefined) {
      throw new Error(
        `Unable to inspect declarations for ${entry.entryPoint}.`,
      );
    }

    const exportedSymbols = checker.getExportsOfModule(moduleSymbol);
    const runtimeNames = runtimeExportNames(entry.runtimePath);
    const declaredNames = new Set(exportedSymbols.map((symbol) => symbol.name));
    const runtimeOnly = [...runtimeNames]
      .filter((name) => !declaredNames.has(name))
      .sort(compareText);
    if (runtimeOnly.length > 0) {
      throw new Error(
        `${
          entry.entryPoint
        } has runtime exports without declarations: ${runtimeOnly.join(', ')}`,
      );
    }

    entryPoints[entry.entryPoint] = exportedSymbols
      .map((symbol) => ({
        name: symbol.name,
        kind: declarationKind(checker, symbol),
        runtime: runtimeNames.has(symbol.name),
        signature: declarationSignature(
          checker,
          printer,
          symbol,
          repositoryRoot,
        ),
      }))
      .sort((left, right) => compareText(left.name, right.name));

    supportingDeclarations[entry.entryPoint] =
      supportingDeclarationsForEntryPoint({
        checker,
        exportedSymbols,
        packageRoot: entry.packageRoot,
        printer,
        repositoryRoot,
      });
  }

  return {
    formatVersion: 2,
    typescriptVersion: ts.version,
    entryPoints,
    supportingDeclarations,
  };
}

function serializeReport(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function parseArguments(argv) {
  const args = new Set(argv);
  return { update: args.has('--update') };
}

export function runPublicApiReport({
  repositoryRoot = defaultRepositoryRoot,
  update = false,
} = {}) {
  const reportsPath = join(repositoryRoot, 'api', 'public-api-reports.json');
  const entries = discoverEntryPoints(repositoryRoot);
  const missing = entries.flatMap((entry) =>
    [entry.typesPath, entry.runtimePath]
      .filter((path) => path !== null && !existsSync(path))
      .map((path) => ({ entryPoint: entry.entryPoint, path })),
  );
  if (missing.length > 0) {
    const details = missing
      .map(
        ({ entryPoint, path }) =>
          `- ${entryPoint}: ${relative(repositoryRoot, path)}`,
      )
      .join('\n');
    throw new Error(
      `Public API report generation requires a fresh build. Missing:\n${details}`,
    );
  }

  const serialized = serializeReport(
    buildPublicApiReport(entries, repositoryRoot),
  );

  if (update) {
    writeFileSync(reportsPath, serialized);
    return `Updated ${relative(repositoryRoot, reportsPath)} for ${
      entries.length
    } entry points.`;
  }

  if (!existsSync(reportsPath)) {
    throw new Error(
      'Public API report is missing. Run `yarn api:report:update`.',
    );
  }
  const expected = readFileSync(reportsPath, 'utf8');
  if (expected !== serialized) {
    throw new Error(
      'Public API declarations changed. Review the change, update the API policy/migration notes, then run `yarn api:report:update`.',
    );
  }
  return `Verified public API reports for ${entries.length} entry points.`;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === scriptPath) {
  try {
    console.log(
      runPublicApiReport({
        ...parseArguments(process.argv.slice(2)),
      }),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
