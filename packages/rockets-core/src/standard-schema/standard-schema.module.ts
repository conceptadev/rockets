import {
  HttpStatus,
  Module,
  StandardSchemaSerializerInterceptor,
  type DynamicModule,
  type Provider,
  type StandardSchemaSerializerInterceptorOptions,
  type StandardSchemaValidationPipeOptions,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';

import { standardSchemaIssuesToDetails } from '../common/utils/standard-schema.util';
import { attachErrorDetails } from '../common/utils/validation-error-details.util';
import { StandardSchemaDtoValidationPipe } from './standard-schema-dto-validation.pipe';

/** Options forwarded to Nest's native validation and serialization helpers. */
export interface StandardSchemaModuleOptions {
  validation?: false | StandardSchemaValidationPipeOptions;
  serialization?: false | StandardSchemaSerializerInterceptorOptions;
}

@Module({})
export class StandardSchemaModule {
  /**
   * Registers the DTO-aware request pipe and Nest's native Standard Schema
   * serializer as global application enhancers.
   */
  static forRoot(options: StandardSchemaModuleOptions = {}): DynamicModule {
    const providers: Provider[] = [];
    const validationOptions = options.validation;
    const serializationOptions = options.serialization;

    if (validationOptions !== false) {
      providers.push({
        provide: APP_PIPE,
        useFactory: () => {
          const effectiveValidationOptions = {
            ...validationOptions,
            ...(validationOptions?.exceptionFactory === undefined
              ? { exceptionFactory: defaultExceptionFactory(validationOptions) }
              : {}),
          };
          return new StandardSchemaDtoValidationPipe(
            effectiveValidationOptions,
          );
        },
      });
    }

    if (serializationOptions !== false) {
      providers.push({
        provide: APP_INTERCEPTOR,
        inject: [Reflector],
        useFactory: (reflector: Reflector) =>
          new StandardSchemaSerializerInterceptor(
            reflector,
            serializationOptions,
          ),
      });
    }

    return {
      module: StandardSchemaModule,
      providers,
    };
  }
}

function defaultExceptionFactory(
  validationOptions: StandardSchemaValidationPipeOptions | undefined,
): (issues: readonly StandardSchemaV1.Issue[]) => object {
  const errorHttpStatusCode =
    validationOptions?.errorHttpStatusCode ?? HttpStatus.BAD_REQUEST;
  return (issues) => {
    const messages = issues.map((issue) => issue.message);
    const ExceptionClass = HttpErrorByCode[errorHttpStatusCode];
    const exception = new ExceptionClass(messages);
    // `HttpErrorByCode` is Nest's own status-to-exception constructor map.
    // Every value constructs an exception object; the generic Type surface
    // cannot express constructor return shape.
    return attachErrorDetails(
      exception as object,
      standardSchemaIssuesToDetails(issues),
    );
  };
}
