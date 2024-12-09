import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';
import { OrgInterface } from '@concepta/nestjs-common';
import { OrgDto } from './org.dto';

/**
 * Org paginated DTO
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
  data: OrgDto[] = [];
}
