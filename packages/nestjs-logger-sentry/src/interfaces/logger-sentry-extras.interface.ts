import { RuntimeExceptionInterface } from '@concepta/nestjs-exception';

export interface LoggerSentryExtrasInterface
  extends Partial<
    Pick<RuntimeExceptionInterface, 'errorCode' | 'safeMessage' | 'context'>
  > {
  statusCode?: number;
  message?: string | unknown;
}
