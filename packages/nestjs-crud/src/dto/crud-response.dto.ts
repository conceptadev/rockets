import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IdentityInterface } from '@rockts-org/nestjs-common';
import { CrudResponseInterface } from '../interfaces/crud-response.interface';

@Exclude()
export class CrudResponseDto<T extends IdentityInterface>
  implements CrudResponseInterface<T>
{
  @Expose()
  @ApiProperty({
    type: 'number',
    description: 'Unique identifier',
  })
  id: T['id'];
}
