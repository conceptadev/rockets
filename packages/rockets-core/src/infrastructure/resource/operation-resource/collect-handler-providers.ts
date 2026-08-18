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

function addModuleClassExports(
  moduleClass: Type<unknown>,
  tokens: Set<unknown>,
): void {
  const exported: unknown = Reflect.getMetadata(
    MODULE_METADATA.EXPORTS,
    moduleClass,
  );
  if (!Array.isArray(exported)) {
    return;
  }
  for (const item of exported) {
    tokens.add(exportToken(item));
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
  for (const raw of imports) {
    const entry = unwrapImportEntry(raw);
    if (entry === undefined || entry === null) {
      continue;
    }
    if (typeof entry === 'function') {
      addModuleClassExports(entry as Type<unknown>, tokens);
      continue;
    }
    if (typeof entry === 'object' && isDynamicModule(entry)) {
      for (const exported of entry.exports ?? []) {
        tokens.add(exportToken(exported));
      }
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
