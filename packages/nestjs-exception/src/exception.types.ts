import { ExceptionContext } from '@concepta/nestjs-common';

export type RuntimeExceptionContext = ExceptionContext & {
  originalError?: Error;
};
