import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceAssigneeInterface } from '@concepta/ts-core';
import { RoleInterface } from '@concepta/ts-common';
import { CommonEntityDto, ReferenceIdDto } from '@concepta/nestjs-common';

/**
 * Role DTO
 */
@Exclude()
export class RoleDto extends CommonEntityDto implements RoleInterface {
  /**
   * Name
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Name of the role',
  })
  @IsString()
  name = '';

  /**
   * Name
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Description of the role',
  })
  @IsString()
  @IsOptional()
  description = '';

  /**
   * Assignee
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: ReferenceIdDto,
    isArray: true,
    description: 'Assignee',
  })
  @Type(() => ReferenceIdDto)
  @ValidateNested({ each: true })
  assignees: ReferenceAssigneeInterface[] = [];
}
