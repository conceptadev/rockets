import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IdentityReferenceInterface } from '@concepta/nestjs-common';
import { CrudResponseInterface } from '../interfaces/crud-response.interface';

@Exclude()
export class CrudResponseDto<T extends IdentityReferenceInterface>
  implements CrudResponseInterface<T>
{
  @Expose()
  @ApiProperty({
    type: 'number',
    description: 'Unique identifier',
  })
  id: T['id'];
}
