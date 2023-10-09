import { Exclude, Expose, Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { OtpCreatableInterface } from '@concepta/ts-common';
import { ReferenceIdDto } from '@concepta/nestjs-common';

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
   * Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).
   *
   * Eg: 60, "2 days", "10h", "7d"
   */
  @Expose()
  @IsString()
  expiresIn = '';

  /**
   * Assignee
   */
  @Expose()
  @Type(() => ReferenceIdDto)
  @ValidateNested()
  assignee: ReferenceIdInterface = new ReferenceIdDto();
}
