import { ReferenceIdInterface } from '@concepta/nestjs-common';
export class UserFixture implements ReferenceIdInterface<string> {
  id!: string;
  username!: string;
}
