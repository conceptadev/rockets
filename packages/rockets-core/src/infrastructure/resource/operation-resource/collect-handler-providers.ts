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
      return undefined;
    }
  }
  return entry;
}

function isDynamicModule(entry: object): entry is DynamicModule {
  return 'module' in entry;
}

/**
 * Whether a class carries `@Module()` metadata. Used to decide whether an
 * export entry is a token or a re-exported module whose own exports must
 * be walked.
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

  const exported: unknown = Reflect.getMetadata(
    MODULE_METADATA.EXPORTS,
    moduleClass,
  );
  if (!Array.isArray(exported)) {
    return;
  }
  addExportEntries(exported, tokens, visited);
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
): void {
  for (const raw of entries) {
    const entry = unwrapImportEntry(raw);
    if (entry === undefined || entry === null) continue;

    if (typeof entry === 'function') {
      tokens.add(entry);
      if (isModuleClass(entry as Type<unknown>)) {
        addModuleExports(entry as Type<unknown>, tokens, visited);
      }
      continue;
    }

    if (typeof entry === 'object' && isDynamicModule(entry)) {
      if (visited.has(entry)) continue;
      visited.add(entry);
      addExportEntries(entry.exports ?? [], tokens, visited);
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
      addExportEntries(entry.exports ?? [], tokens, visited);
    }
  }
  return tokens;
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
  const suppliedTokens = new Set<unknown>([
    ...explicitProviders.map(providerToken),
    ...collectImportedExportTokens(imports),
  ]);
  const seen = new Set<Type<OperationHandler>>();
  for (const operation of Object.values(operations)) {
    const handlerClass = getHandlerClass(operation.handler);
    if (handlerClass === undefined) {
      continue;
    }
    if (suppliedTokens.has(handlerClass) || seen.has(handlerClass)) {
      continue;
    }
    seen.add(handlerClass);
    providers.push(handlerClass);
  }
  return providers;
}
