import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';
import { OrgInterface } from '../interfaces/org.interface';
import { OrgDto } from './org.dto';

/**
 * User paginated DTO
 */
@Exclude()
export class OrgPaginatedDto extends CrudResponsePaginatedDto<OrgInterface> {
  @Expose()
  @ApiProperty({
    type: OrgDto,
    isArray: true,
    description: 'Array of Orgs',
  })
  @Type(() => OrgDto)
  data: OrgDto[];
}
