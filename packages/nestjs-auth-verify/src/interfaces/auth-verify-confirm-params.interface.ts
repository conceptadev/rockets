import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthVerifyConfirmParamsInterface {
  passcode: string;
  queryOptions?: QueryOptionsInterface;
}
