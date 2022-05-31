import { Exclude, Expose } from 'class-transformer';
import { ReferenceIdInterface } from '@concepta/ts-core';

@Exclude()
export class ReferenceIdDto implements ReferenceIdInterface {
  @Expose()
  id: string;
}
