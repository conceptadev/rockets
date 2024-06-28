import { Exclude, Expose, Type } from 'class-transformer';
import { Allow, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CacheInterface } from '@concepta/ts-common';
import { CommonEntityDto, ReferenceIdDto } from '@concepta/nestjs-common';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Cache Create DTO
 */
@Exclude()
export class CacheDto extends CommonEntityDto implements CacheInterface {
  /**
   * key
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'key',
  })
  @IsString()
  key = '';

  /**
   * data
   */
  @Expose()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'data',
  })
  @IsOptional()
  data!: string | null;

  /**
   * type
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'type',
  })
  @IsString()
  type = '';

  /**
   * Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).
   *
   * Eg: 60, "2 days", "10h", "7d"
   */
  @Expose()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'type',
    examples: ['60', '2 days', '10h', '7d'],
  })
  @IsOptional()
  expiresIn!: string | null;

  /**
   * Assignee
   */
  @Expose()
  @Type(() => ReferenceIdDto)
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'assignee',
  })
  @ValidateNested()
  assignee: ReferenceIdInterface = new ReferenceIdDto();

  /**
   * expirationDate
   */
  @Allow()
  @Type(() => Date)
  @IsOptional()
  expirationDate!: Date | null;
}
