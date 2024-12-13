import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InvitationInterface } from '@concepta/nestjs-common';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';

import { InvitationDto } from './invitation.dto';

/**
 * User paginated DTO
 */
@Exclude()
export class InvitationPaginatedDto extends CrudResponsePaginatedDto<InvitationInterface> {
  @Expose()
  @ApiProperty({
    type: InvitationDto,
    isArray: true,
    description: 'Array of Invitations',
  })
  @Type(() => InvitationDto)
  data: InvitationDto[] = [];
}
