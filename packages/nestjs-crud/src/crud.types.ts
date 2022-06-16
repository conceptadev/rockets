import { Type } from '@nestjs/common';
import { CrudOptions as xCrudOptions } from '@nestjsx/crud';

export type CrudValidationOptions = xCrudOptions['validation'];

/* eslint-disable-next-line @typescript-eslint/ban-types */
export type DecoratorTargetObject<T extends Object = Object> = Type<T> | T;

/* eslint-disable-next-line @typescript-eslint/ban-types */
export type ReflectionTargetOrHandler = Function | Type<Object>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type AdditionalCrudMethodArgs = any[];
