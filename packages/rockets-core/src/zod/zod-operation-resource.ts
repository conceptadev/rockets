import type { Type } from '@nestjs/common';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import type {
  CompiledOperationDescriptor,
  OperationHandlerRef,
  OperationHttpMethod,
  OperationResourceDefinition,
} from '../domain/interfaces/operation-resource.interface';
import { defineOperationResource } from '../infrastructure/resource/define-operation-resource';
import type { OperationResource } from '../domain/interfaces/operation-resource.interface';
import { compileDtoClass } from './zod-dto';

type InferIn<TInput> = [TInput] extends [z.ZodObject]
  ? z.output<TInput>
  : unknown;

type InferOut<TOutput> = [TOutput] extends [z.ZodType]
  ? z.output<TOutput>
  : unknown;

type OperationOutputSchema = z.ZodObject | z.ZodArray;

export interface OperationBuilderConfig<
  TInput extends z.ZodObject | undefined = undefined,
  TOutput extends OperationOutputSchema | undefined = undefined,
> {
  readonly method?: OperationHttpMethod;
  readonly path?: string;
  readonly status?: number;
  readonly summary?: string;
  readonly public?: boolean;
  readonly transactional?: boolean;
  /**
   * Body (POST/PUT/PATCH) or query (GET/DELETE).
   * Query string values are strings — use `z.coerce.number()` / `z.coerce.boolean()`
   * when the handler expects non-string types.
   */
  readonly input?: TInput;
  /**
   * Response schema (`z.object(...)` or `z.array(z.object(...))`).
   * Handler returns are validated against this; mismatches are HTTP 500.
   */
  readonly output?: TOutput;
  readonly handler: OperationHandlerRef<InferIn<TInput>, InferOut<TOutput>>;
  readonly decorators?: readonly MethodDecorator[];
}

export type PendingOperation = {
  readonly kind: 'query' | 'command';
  readonly config: OperationBuilderConfig<
    z.ZodObject | undefined,
    OperationOutputSchema | undefined
  >;
};

/**
 * Declare a read-style operation (default GET, status 200).
 */
export function query<
  TInput extends z.ZodObject | undefined = undefined,
  TOutput extends OperationOutputSchema | undefined = undefined,
>(config: OperationBuilderConfig<TInput, TOutput>): PendingOperation {
  return {
    kind: 'query',
    config: config as PendingOperation['config'],
  };
}

/**
 * Declare a write-style operation (default POST, status 200).
 */
export function command<
  TInput extends z.ZodObject | undefined = undefined,
  TOutput extends OperationOutputSchema | undefined = undefined,
>(config: OperationBuilderConfig<TInput, TOutput>): PendingOperation {
  return {
    kind: 'command',
    config: config as PendingOperation['config'],
  };
}

export interface OperationResourceInput {
  readonly path: string;
  readonly tags?: readonly string[];
  readonly public?: boolean;
  readonly operations: Readonly<Record<string, PendingOperation>>;
  readonly imports?: OperationResourceDefinition['imports'];
  readonly providers?: OperationResourceDefinition['providers'];
  readonly exports?: OperationResourceDefinition['exports'];
  readonly decorators?: OperationResourceDefinition['decorators'];
}

function defaultMethod(
  kind: 'query' | 'command',
  configured: OperationHttpMethod | undefined,
): OperationHttpMethod {
  if (configured !== undefined) {
    return configured;
  }
  return kind === 'query' ? 'GET' : 'POST';
}

/**
 * Default HTTP status is 200 for both query and command.
 * Use `status: 201` (or another code) on the builder when a create-style
 * response is required — we do not infer 201 from `command` alone.
 */
function defaultStatus(configured: number | undefined): number {
  return configured ?? 200;
}

function compileOperationDto(schema: z.ZodType, name: string): Type<object> {
  if (schema instanceof z.ZodObject) {
    return compileDtoClass(schema, name);
  }
  if (schema instanceof z.ZodArray) {
    const cls = createZodDto(schema);
    Object.defineProperty(cls, 'name', { value: name });
    return cls;
  }
  throw new Error(
    `operationResource DTO "${name}": expected z.object(...) or z.array(...), ` +
      `got ${schema.constructor.name}`,
  );
}

function compileOperation(
  key: string,
  pending: PendingOperation,
  resourcePath: string,
): CompiledOperationDescriptor {
  const { kind, config } = pending;
  const method = defaultMethod(kind, config.method);
  const status = defaultStatus(config.status);
  const path = config.path ?? '';

  let inputDto: Type<object> | undefined;
  if (config.input !== undefined) {
    inputDto = compileDtoClass(
      config.input,
      `${pascal(resourcePath)}_${pascal(key)}Input`,
    );
  }

  let outputDto: Type<object> | undefined;
  if (config.output !== undefined) {
    outputDto = compileOperationDto(
      config.output,
      `${pascal(resourcePath)}_${pascal(key)}Output`,
    );
  }

  return {
    key,
    kind,
    method,
    path,
    status,
    summary: config.summary,
    public: config.public,
    transactional: config.transactional,
    inputDto,
    outputDto,
    handler: config.handler,
    decorators: config.decorators,
  };
}

function pascal(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Zod-first sibling of {@link defineResource} for typed non-CRUD endpoints.
 *
 * Compiles Zod input/output schemas to DTO classes (OpenAPI + Standard Schema
 * validation) and registers a generated Nest controller via
 * {@link defineOperationResource}.
 *
 * v1 covers `query()` and `command()` only — cursor, SSE, binary, raw JSON,
 * idempotency helpers, and external-client scaffolds are follow-ups.
 */
export function operationResource(
  input: OperationResourceInput,
): OperationResource {
  const operations: Record<string, CompiledOperationDescriptor> = {};
  for (const [key, pending] of Object.entries(input.operations)) {
    operations[key] = compileOperation(key, pending, input.path);
  }

  return defineOperationResource({
    path: input.path,
    tags: input.tags,
    public: input.public,
    operations,
    imports: input.imports,
    providers: input.providers,
    exports: input.exports,
    decorators: input.decorators,
  });
}
