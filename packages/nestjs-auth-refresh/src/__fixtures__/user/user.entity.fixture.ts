import { ReferenceIdInterface } from '@concepta/ts-core';
export class UserFixture implements ReferenceIdInterface<string> {
  id!: string;
  username!: string;
}
