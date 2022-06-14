import { IsString } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuditInterface } from '@concepta/ts-core';
import { AuditDto, ReferenceIdDto } from '@concepta/nestjs-common';
import { CrudResponseDto } from '@concepta/nestjs-crud';
import { OtpInterface } from '../interfaces/otp.interface';
import { OtpAssigneeInterface } from '../interfaces/otp-assignee.interface';

/**
 * Otp DTO
 */
@Exclude()
export class OtpDto
  extends CrudResponseDto<OtpInterface>
  implements OtpInterface
{
  /**
   * category
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'category of the otp',
  })
  @IsString()
  category: string;

  /**
   * type
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'type of the otp',
  })
  @IsString()
  type: string;

  /**
   * passCode
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'passCode of the otp',
  })
  @IsString()
  passCode: string;

  /**
   * Assignee
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'assignee data',
  })
  @Type(() => ReferenceIdDto)
  assignee: OtpAssigneeInterface;

  /**
   * Audit
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: AuditDto,
    description: 'Audit data',
  })
  @Type(() => AuditDto)
  audit?: AuditInterface;
}
