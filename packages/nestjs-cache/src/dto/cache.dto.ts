import { Exclude, Expose, Type } from 'class-transformer';
import { Allow, IsString, ValidateNested } from 'class-validator';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CacheInterface } from '@concepta/ts-common';
import { CommonEntityDto, ReferenceIdDto } from '@concepta/nestjs-common';

/**
 * Cache Create DTO
 */
@Exclude()
export class CacheDto extends CommonEntityDto implements CacheInterface {
  /**
   * key
   */
  @Expose()
  @IsString()
  key = '';

  /**
   * data
   */
  @Expose()
  @IsString()
  data = '';

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

  /**
   * expirationDate
   */
  @Allow()
  @Type(() => Date)
  expirationDate!: Date;
}
