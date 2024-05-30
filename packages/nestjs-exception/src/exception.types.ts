import { ExceptionContext } from '@concepta/ts-core';

export type RuntimeExceptionContext = ExceptionContext & {
  originalError?: Error;
};
