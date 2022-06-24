import { Exclude, Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { ReferenceIdDto } from '@concepta/nestjs-common';
import { OtpCreatableInterface } from '../interfaces/otp-creatable.interface';

/**
 * Otp Create DTO
 */
@Exclude()
export class OtpCreateDto implements OtpCreatableInterface {
  /**
   * category
   */
  @Expose()
  @IsString()
  category = '';

  /**
   * type
   */
  @Expose()
  @IsString()
  type = '';

  /**
   * Assignee
   */
  @Expose()
  @Type(() => ReferenceIdDto)
  assignee: ReferenceIdInterface = new ReferenceIdDto();
}
