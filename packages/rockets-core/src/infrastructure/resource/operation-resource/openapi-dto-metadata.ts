import type { Type } from '@nestjs/common';

export interface OperationDtoOpenApiField {
  readonly name: string;
  readonly required: boolean;
  readonly schema: Record<string, unknown>;
}

const OPERATION_DTO_OPENAPI_FIELDS = Symbol.for(
  '@concepta/rockets-core/operation-dto-openapi-fields',
);

export function attachOperationDtoOpenApiFields(
  dto: Type<object>,
  fields: readonly OperationDtoOpenApiField[],
): void {
  Object.defineProperty(dto, OPERATION_DTO_OPENAPI_FIELDS, {
    configurable: false,
    enumerable: false,
    value: fields,
  });
}

export function readOperationDtoOpenApiFields(
  dto: Type<object>,
): readonly OperationDtoOpenApiField[] | undefined {
  const value = Reflect.get(dto, OPERATION_DTO_OPENAPI_FIELDS);
  return Array.isArray(value)
    ? (value as readonly OperationDtoOpenApiField[])
    : undefined;
}
