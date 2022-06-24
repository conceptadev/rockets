import { Exclude, Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { ReferenceIdDto } from '@concepta/nestjs-common';
import { OtpCreatableInterface } from '../interfaces/otp-creatable.interface';
import { OtpAssigneeInterface } from '../interfaces/otp-assignee.interface';

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
  assignee: OtpAssigneeInterface = new ReferenceIdDto();
}
