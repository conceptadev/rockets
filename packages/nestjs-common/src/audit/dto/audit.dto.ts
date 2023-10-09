import { IsDate, IsNumber } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuditInterface } from '@concepta/ts-core';

/**
 * Audit DTO
 */
@Exclude()
export class AuditDto implements AuditInterface {
  /**
   * Date created
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Date created',
  })
  @Type(() => Date)
  @IsDate()
  dateCreated!: Date;

  /**
   * Date updated
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Date updated',
  })
  @Type(() => Date)
  @IsDate()
  dateUpdated!: Date;

  /**
   * Date deleted
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Date deleted',
  })
  @Type(() => Date)
  @IsDate()
  dateDeleted!: Date;

  /**
   * Version
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: 'number',
    description: 'Version of the data',
  })
  @IsNumber()
  version!: number;
}
