import { Type } from '@nestjs/common';
import { CrudOptions as xCrudOptions } from '@nestjsx/crud';

export type CrudValidationOptions = xCrudOptions['validation'];

/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
export type DecoratorTargetObject<T = any> = Type<T> | T;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
export type ReflectionTargetOrHandler = Function | Type<any>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type AdditionalCrudMethodArgs = any[];
