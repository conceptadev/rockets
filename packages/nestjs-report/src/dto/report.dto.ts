import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { ReportInterface, ReportStatusEnum } from '@concepta/ts-common';
import { CommonEntityDto, ReferenceIdDto } from '@concepta/nestjs-common';

/**
 * Report DTO
 */
@Exclude()
export class ReportDto extends CommonEntityDto implements ReportInterface {
  /**
   * Storage provider key
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'serviceKey of the report',
  })
  @IsString()
  serviceKey = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Name of the report',
  })
  @IsString()
  name = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Error message for when tried to generate report',
  })
  @IsString()
  errorMessage = '';

  @Exclude()
  @ApiProperty({
    enum: ReportStatusEnum,
    enumName: 'ReportStatusEnum',
    description: 'Status of the report',
  })
  @IsEnum(ReportStatusEnum)
  status = ReportStatusEnum.Processing;

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Dynamic download URL for the report',
  })
  @IsString()
  @IsOptional()
  downloadUrl = '';

  @Expose()
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'The file of the report',
  })
  @Type(() => ReferenceIdDto)
  @ValidateNested()
  file: ReferenceIdInterface = { id: '' };
}
