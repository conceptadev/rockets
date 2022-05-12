import { IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceId } from '@concepta/nestjs-common';
import { CrudResponseDto } from '@concepta/nestjs-crud';
import { OrgInterface } from '../interfaces/org.interface';

/**
 * Org DTO
 */
@Exclude()
export class OrgDto
  extends CrudResponseDto<OrgInterface>
  implements OrgInterface
{
  /**
   * Unique id
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Unique identifier',
  })
  @IsString()
  id: ReferenceId;

  /**
   * Name
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Name of the org',
  })
  @IsString()
  name: string;

  /**
   * createdAt
   */
  @Expose()
  @ApiProperty({
    type: 'date',
    description: 'org created at date',
  })
  @IsString()
  createdAt: Date;

  /**
   * updatedAt
   */
  @Expose()
  @ApiProperty({
    type: 'date',
    description: 'org updated at date',
  })
  @IsString()
  updatedAt: Date;

  /**
   * deletedAt
   */
  @Expose()
  @ApiProperty({
    type: 'date',
    description: 'org updated at date',
  })
  deletedAt: Date;
  /**
   * deletedAt
   */
  @Expose()
  @ApiProperty({
    type: 'boolean',
    description: 'True if Org is active',
  })
  active: boolean;

  /**
   * ownerUserId
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'userId of owner of the org',
  })
  @IsString()
  @IsOptional()
  ownerUserId?: string;
}
