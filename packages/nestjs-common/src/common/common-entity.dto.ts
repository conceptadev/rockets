import { AuditInterface, ReferenceIdInterface } from '@concepta/ts-core';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { AuditDto } from '../audit/dto/audit.dto';

/**
 * User DTO
 */
@Exclude()
export class CommonEntityDto
  extends AuditDto
  implements ReferenceIdInterface, AuditInterface
{
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Unique identifier',
  })
  @IsString()
  id = '';
}
