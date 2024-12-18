import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthVerifyServiceInterface {
  send(email: string, queryOptions?: QueryOptionsInterface): Promise<void>;
  confirmUser(
    passcode: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReferenceIdInterface | null>;
  revokeAllUserVerifyToken(
    email: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;
}
