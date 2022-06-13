import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CrudResponseInterface } from '../interfaces/crud-response.interface';

@Exclude()
export class CrudResponseDto<T extends ReferenceIdInterface>
  implements CrudResponseInterface<T>
{
  @Expose()
  @ApiProperty({
    type: 'number',
    description: 'Unique identifier',
  })
  id: T['id'] = '';
}
