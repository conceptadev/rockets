import { ReferenceUsername } from '@concepta/nestjs-common';

export interface AuthLocalLoginInterface {
  username: ReferenceUsername;
  password: string;
}
