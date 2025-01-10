import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthVerifySendParamsInterface {
  email: string;
  queryOptions?: QueryOptionsInterface;
}
