import { Body, Type } from '@nestjs/common';

/**
 * @CrudBody() parameter decorator
 */
export function CrudBody(): ParameterDecorator;

export function CrudBody(
  ...pipes: Parameters<typeof Body>[1][]
): ParameterDecorator;

export function CrudBody(
  property: Parameters<typeof Body>[0],
  ...pipes: Parameters<typeof Body>[1][]
): ParameterDecorator;

export function CrudBody(
  property?: Parameters<typeof Body>[0] | Parameters<typeof Body>[1],
  ...pipes: Parameters<typeof Body>[1][]
): ParameterDecorator {
  return (
    target: Type,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const bodyDecorator =
      typeof property === 'string' ? Body(property, ...pipes) : Body(...pipes);

    return bodyDecorator(target, propertyKey, parameterIndex);
  };
}
