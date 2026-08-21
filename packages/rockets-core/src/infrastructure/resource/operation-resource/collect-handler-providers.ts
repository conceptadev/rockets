import type {
  DynamicModule,
  ForwardReference,
  Provider,
  Type,
} from '@nestjs/common';
import { MODULE_METADATA } from '@nestjs/common/constants';

import type {
  CompiledOperationDescriptor,
  OperationHandler,
  OperationResourceDefinition,
} from '../../../domain/interfaces/operation-resource.interface';
import { getHandlerClass } from './is-handler-class';

function providerToken(provider: Provider): unknown {
  if (typeof provider === 'function') {
    return provider;
  }
  if (typeof provider === 'object' && 'provide' in provider) {
    return provider.provide;
  }
  return undefined;
}

function exportToken(value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'provide' in value) {
    return (value as { provide: unknown }).provide;
  }
  return value;
}

/**
 * Sentinel for a `forwardRef` whose factory THROWS at definition time —
 * the TDZ circular-import case forwardRef exists for. Its exports are
 * unknowable here; swallowing the throw and returning `undefined` made
 * the module invisible, so a handler it exports was silently
 * auto-registered as a duplicate — the exact defect this file's docs
 * promise the export walk prevents.
 */
export const UNINSPECTABLE_IMPORT = Symbol('UNINSPECTABLE_IMPORT');

function unwrapImportEntry(entry: unknown): unknown {
  if (
    typeof entry === 'object' &&
    entry !== null &&
    'forwardRef' in entry &&
    typeof (entry as ForwardReference).forwardRef === 'function'
  ) {
    try {
      return (entry as ForwardReference).forwardRef();
    } catch {
      return UNINSPECTABLE_IMPORT;
    }
  }
  return entry;
}

function isDynamicModule(entry: object): entry is DynamicModule {
  return 'module' in entry;
}

/**
 * Whether a class carries `@Module()` metadata.
 *
 * Deliberately NOT sufficient on its own: `@Module()` only defines the
 * keys present in the object it is given, so the canonical dynamic-module
 * host — `@Module({}) class X { static forRoot(): DynamicModule }`, the
 * shape of every `@concepta/nestjs-*` module — carries **no metadata at
 * all** and is invisible here. `resolveReExportedDynamicModule` covers
 * that case.
 */
function isModuleClass(value: Type<unknown>): boolean {
  return (
    Reflect.getMetadata(MODULE_METADATA.EXPORTS, value) !== undefined ||
    Reflect.getMetadata(MODULE_METADATA.PROVIDERS, value) !== undefined ||
    Reflect.getMetadata(MODULE_METADATA.IMPORTS, value) !== undefined ||
    Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, value) !== undefined
  );
}

/**
 * Finds the `DynamicModule` a metadata-less exported class stands for.
 *
 * `@Module({ imports: [Billing.forRoot()], exports: [Billing] })` is the
 * standard way to re-export configured infrastructure: the export entry
 * is the bare host CLASS, while the exports that matter live on the
 * `DynamicModule` sitting in `imports`. Matching them up is what makes
 * `Platform → Billing.forRoot()` reachable.
 */
function resolveReExportedDynamicModule(
  entry: Type<unknown>,
  hostImports: readonly unknown[],
): DynamicModule | undefined {
  for (const raw of hostImports) {
    const imported = unwrapImportEntry(raw);
    if (
      typeof imported === 'object' &&
      imported !== null &&
      isDynamicModule(imported) &&
      imported.module === entry
    ) {
      return imported;
    }
  }
  return undefined;
}

/**
 * Walks a module's `exports` and records every token it makes available.
 *
 * Nest re-exports transitively: `exports: [InnerModule]` publishes
 * everything `InnerModule` itself exports. Reading only direct entries
 * missed that, so a handler reachable through `Outer → Inner` looked
 * unsupplied, was auto-registered locally, and shadowed the imported
 * provider — with dependencies private to `InnerModule` the app then
 * failed to bootstrap at all.
 *
 * `visited` guards the mutually-re-exporting case; Nest tolerates it and
 * an unguarded walk would not.
 */
function addModuleExports(
  moduleClass: Type<unknown>,
  tokens: Set<unknown>,
  visited: Set<unknown>,
): void {
  if (visited.has(moduleClass)) return;
  visited.add(moduleClass);

  const exported = readModuleMetadata(moduleClass, MODULE_METADATA.EXPORTS);
  if (exported.length === 0) return;

  // This module's own imports, so a metadata-less exported class can be
  // matched against the `DynamicModule` it stands for.
  const imported = readModuleMetadata(moduleClass, MODULE_METADATA.IMPORTS);
  addExportEntries(exported, tokens, visited, imported);
}

function readModuleMetadata(
  moduleClass: Type<unknown>,
  metadataKey: string,
): readonly unknown[] {
  const value: unknown = Reflect.getMetadata(metadataKey, moduleClass);
  return Array.isArray(value) ? value : [];
}

/**
 * Records each export entry as a token, and recurses when the entry is
 * itself a module (class or `DynamicModule`).
 *
 * A class entry is added as a token AND recursed into when it carries
 * module metadata: nothing injects a module class as a handler, so the
 * extra token is inert, and this avoids having to decide the ambiguous
 * "is this class a provider or a module" question in one direction only.
 */
function addExportEntries(
  entries: readonly unknown[],
  tokens: Set<unknown>,
  visited: Set<unknown>,
  hostImports: readonly unknown[] = [],
): void {
  for (const raw of entries) {
    const entry = unwrapImportEntry(raw);
    // A throwing forwardRef inside `exports: [...]` (the circular
    // re-export idiom) is as unknowable as one in `imports` — the
    // first revision handled only the top-level loop, and the exact
    // silent-duplicate defect survived one frame down.
    if (entry === UNINSPECTABLE_IMPORT) {
      tokens.add(UNINSPECTABLE_IMPORT);
      continue;
    }
    if (entry === undefined || entry === null) continue;

    if (typeof entry === 'function') {
      tokens.add(entry);
      const moduleClass = entry as Type<unknown>;

      // Both halves, never one. Nest's scanner unions a module's static
      // `@Module` exports with the dynamic ones its factory returned
      // (`reflectExports`), and a configured module routinely populates
      // both: static metadata for what it always publishes, dynamic for
      // what `forRoot()` adds. Returning after the static half left the
      // dynamic exports unseen, so a handler published only by
      // `forRoot()` was auto-registered locally and its module-private
      // dependencies became unresolvable — the same boot failure the
      // direct-import path was fixed for.
      if (isModuleClass(moduleClass)) {
        addModuleExports(moduleClass, tokens, visited);
      }
      const dynamic = resolveReExportedDynamicModule(moduleClass, hostImports);
      if (dynamic !== undefined && !visited.has(dynamic)) {
        visited.add(dynamic);
        // ONE descent function everywhere. Three prior fixes each
        // patched one call site and left this one walking exports
        // WITHOUT the module's imports — so a three-level chain
        // (Platform → Billing → Payments, each re-exporting the bare
        // host class) broke at the level this call reached: Payments
        // never matched, its handler was re-registered locally, and
        // its module-private symbol failed the boot (review round 4).
        addDynamicModuleExports(dynamic, tokens, visited);
      }
      continue;
    }

    if (typeof entry === 'object' && isDynamicModule(entry)) {
      if (visited.has(entry)) continue;
      visited.add(entry);
      addDynamicModuleExports(entry, tokens, visited);
      continue;
    }

    tokens.add(exportToken(entry));
  }
}

/**
 * Tokens exported by `imports` entries that Nest can resolve without a local
 * `providers` registration. Static only — Promise-based lazy imports are
 * invisible here (caller must list the handler in `providers` or use
 * `{ useClass }` with an explicit provider).
 */
function collectImportedExportTokens(
  imports: OperationResourceDefinition['imports'],
): Set<unknown> {
  const tokens = new Set<unknown>();
  if (imports === undefined) {
    return tokens;
  }
  const visited = new Set<unknown>();
  for (const raw of imports) {
    const entry = unwrapImportEntry(raw);
    if (entry === UNINSPECTABLE_IMPORT) {
      tokens.add(UNINSPECTABLE_IMPORT);
      continue;
    }
    if (entry === undefined || entry === null) {
      continue;
    }
    if (typeof entry === 'function') {
      addModuleExports(entry as Type<unknown>, tokens, visited);
      continue;
    }
    if (typeof entry === 'object' && isDynamicModule(entry)) {
      if (visited.has(entry)) continue;
      visited.add(entry);
      addDynamicModuleExports(entry, tokens, visited);
    }
  }
  return tokens;
}

/**
 * A `DynamicModule`'s imports and exports are each the union of what the
 * call returned and what its host class declares statically.
 *
 * Nest merges the two, and the common configured-module shape puts them
 * in the STATIC half:
 *
 * ```ts
 * @Module({ providers: [Handler], exports: [Handler] })
 * class Host { static forRoot(): DynamicModule { return { module: Host } } }
 * ```
 *
 * `Host.forRoot()` carries no `exports` of its own, so reading only the
 * dynamic half concluded the handler was unsupplied, auto-registered it
 * locally, and the copy in `RocketsOperationResource` then failed to
 * resolve a dependency private to `Host`.
 *
 * This is the direct-import twin of `resolveReExportedDynamicModule`,
 * which covers the same class reached through a re-export instead.
 */
function addDynamicModuleExports(
  entry: DynamicModule,
  tokens: Set<unknown>,
  visited: Set<unknown>,
): void {
  const host = entry.module;
  visited.add(host);
  const staticImports = readModuleMetadata(host, MODULE_METADATA.IMPORTS);
  const staticExports = readModuleMetadata(host, MODULE_METADATA.EXPORTS);

  // Match Nest's scanner: static metadata comes first, followed by the
  // dynamic metadata returned by forRoot/register. Keeping the two halves
  // separate misses valid cross-half re-exports and duplicates their handlers
  // in the generated operation module.
  addExportEntries(
    [...staticExports, ...(entry.exports ?? [])],
    tokens,
    visited,
    [...staticImports, ...(entry.imports ?? [])],
  );
}

/**
 * Auto-register injectable handler classes that are not already supplied via
 * `providers` or an imported module's `exports`.
 */
export function collectHandlerProviders(
  operations: Readonly<Record<string, CompiledOperationDescriptor>>,
  explicitProviders: readonly Provider[],
  imports: OperationResourceDefinition['imports'],
): Provider[] {
  const providers: Provider[] = [];
  const importedTokens = collectImportedExportTokens(imports);
  const suppliedTokens = new Set<unknown>([
    ...explicitProviders.map(providerToken),
    ...importedTokens,
  ]);
  const hasUninspectableImport = importedTokens.has(UNINSPECTABLE_IMPORT);
  const seen = new Set<Type<OperationHandler>>();
  for (const operation of Object.values(operations)) {
    const handlerClass = getHandlerClass(operation.handler);
    if (handlerClass === undefined) {
      continue;
    }
    if (suppliedTokens.has(handlerClass) || seen.has(handlerClass)) {
      continue;
    }
    // A throwing forwardRef makes the auto-register decision a coin
    // flip: the invisible module may export this very handler, and
    // registering a second copy silently shadows it (or fails the boot
    // on its module-private deps). Refuse loudly instead — explicit
    // beats a duplicate nobody asked for.
    if (hasUninspectableImport) {
      throw new Error(
        `operationResource: handler "${handlerClass.name}" would be ` +
          'auto-registered, but an imported `forwardRef` cannot be ' +
          'inspected at definition time (its factory throws — the ' +
          'circular-import case). If that module supplies the handler, ' +
          'nothing is needed once the cycle resolves; otherwise list the ' +
          "handler explicitly in this resource's `providers` to make " +
          'ownership unambiguous.',
      );
    }
    seen.add(handlerClass);
    providers.push(handlerClass);
  }
  return providers;
}
