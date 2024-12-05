import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { AuditDto } from '../../audit/dto/audit.dto';
import { AuditInterface } from '../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../reference/interfaces/reference-id.interface';

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
