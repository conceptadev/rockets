import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  AuditDateCreated,
  AuditDateDeleted,
  AuditDateUpdated,
  AuditInterface,
} from '@concepta/ts-core';

/**
 * Audit DTO
 */
@Exclude()
export class AuditDto implements AuditInterface {
  /**
   * Date created
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Date created',
  })
  @Type(() => Date)
  @IsDate()
  dateCreated!: AuditDateCreated;

  /**
   * Date updated
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Date updated',
  })
  @Type(() => Date)
  @IsDate()
  dateUpdated!: AuditDateUpdated;

  /**
   * Date deleted
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Date deleted',
    nullable: true,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateDeleted!: AuditDateDeleted;

  /**
   * Version
   */
  @Expose()
  @ApiProperty({
    type: 'number',
    description: 'Version of the data',
  })
  @IsNumber()
  version!: number;
}
