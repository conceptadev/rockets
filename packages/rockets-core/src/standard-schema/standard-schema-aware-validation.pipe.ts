import {
  Injectable,
  InternalServerErrorException,
  ValidationPipe,
  type ArgumentMetadata,
  type ValidationPipeOptions,
} from '@nestjs/common';
import { getMetadataStorage } from 'class-validator';

import { getCarriedStandardSchema } from './schema';
import { StandardSchemaDtoValidationPipe } from './standard-schema-dto-validation.pipe';

/**
 * Nest's `ValidationPipe` that VALIDATES schema-carrying DTOs with their
 * schema instead of destroying them (issue #83).
 *
 * `ValidationPipe({ whitelist: true })` strips every property without
 * class-validator metadata, so a schema DTO's body arrived at the
 * handler as `{}` — silently, with a success status. The first draft of
 * this pipe SKIPPED schema carriers on the assumption that "something
 * upstream validated them" — an assumption it never checked, which
 * meant the pipe used alone (exactly how the README presented it)
 * disabled all validation: `{ name: '', evil: 'x' }` reached the
 * handler as-is with a `201`. Worse than the bug being fixed. The pipe
 * has the schema in hand, so it validates with it — standalone use is
 * safe. Register EXACTLY ONE schema validator per route: pairing this
 * with `StandardSchemaModule`'s pipe parses twice, and a TRANSFORMING
 * schema (`z.coerce`, `.transform()`) is not idempotent — the second
 * parse corrupts the first's output or rejects it (pinned by a test).
 *
 * Options split, stated plainly: `transform` and `errorHttpStatusCode`
 * are forwarded to the schema path, so both DTO kinds fail with the
 * same status. `whitelist` / `forbidNonWhitelisted` cannot apply to a
 * schema carrier (the schema itself decides unknown keys) and
 * `exceptionFactory` speaks `ValidationError[]`, not schema issues —
 * those three affect class-validator DTOs only.
 *
 * A metatype carrying BOTH a schema and class-validator CONSTRAINTS is
 * ambiguous — two validators, two vocabularies, no defined winner — and
 * is rejected loudly rather than one being silently skipped. `@Allow()`
 * metadata is not a constraint (it asserts nothing, it exists purely to
 * survive whitelists) and never triggers the rejection, whoever stamped
 * it.
 */
@Injectable()
export class StandardSchemaAwareValidationPipe extends ValidationPipe {
  private readonly schemaPipe: StandardSchemaDtoValidationPipe;

  constructor(options?: ValidationPipeOptions) {
    super(options);
    // Forward what maps 1:1 so a consumer's uniform error contract does
    // not silently split by DTO kind (a 422 app answering 400 on schema
    // routes only was the reviewed failure).
    this.schemaPipe = new StandardSchemaDtoValidationPipe({
      ...(options?.transform !== undefined
        ? { transform: options.transform }
        : {}),
      ...(options?.errorHttpStatusCode !== undefined
        ? { errorHttpStatusCode: options.errorHttpStatusCode }
        : {}),
    });
  }

  override async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const metatype = metadata.metatype;
    if (
      metadata.schema === undefined &&
      getCarriedStandardSchema(metatype) === undefined
    ) {
      return super.transform(value, metadata);
    }

    if (metatype !== undefined && hasClassValidatorConstraints(metatype)) {
      throw new InternalServerErrorException(
        `StandardSchemaAwareValidationPipe: ${metatype.name} carries BOTH a ` +
          'Standard Schema and class-validator constraints. Two validators ' +
          'with no defined winner is an ambiguity this pipe refuses to ' +
          'resolve silently — validate with the schema OR with decorators, ' +
          'not both.',
      );
    }

    return this.schemaPipe.transform(value, metadata);
  }
}

/**
 * Any class-validator metadata that ASSERTS something. `Allow` registers
 * as `'whitelistValidation'` — probed against the installed
 * class-validator, not guessed; an earlier draft compared against
 * `'whitelist'` and would have rejected every DTO Rockets stamps — and
 * asserts nothing, so it never counts, whoever wrote it.
 */
function hasClassValidatorConstraints(metatype: object): boolean {
  return getMetadataStorage()
    .getTargetValidationMetadatas(
      metatype as new () => object,
      '',
      false,
      false,
    )
    .some((meta) => meta.type !== 'whitelistValidation');
}
