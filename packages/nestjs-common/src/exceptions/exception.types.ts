import { ExceptionContext } from '../core.types';

export type RuntimeExceptionContext = ExceptionContext & {
  originalError?: Error;
};
