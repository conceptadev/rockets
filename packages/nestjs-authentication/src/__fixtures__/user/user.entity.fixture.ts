import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { Entity } from 'typeorm';

@Entity()
export class UserFixture implements ReferenceIdInterface {
  id!: string;
  username!: string;
}
