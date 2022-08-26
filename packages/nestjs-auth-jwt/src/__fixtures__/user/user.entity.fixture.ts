import { ReferenceIdInterface } from '@concepta/ts-core';
import { Entity } from 'typeorm';

@Entity()
export class UserFixture implements ReferenceIdInterface {
  id!: string;
}
