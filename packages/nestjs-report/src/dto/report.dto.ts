import { CommonEntityDto, ReferenceIdDto } from '@concepta/nestjs-common';
import { ReportStatusEnum } from '@concepta/ts-common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ReportEntityInterface } from '../interfaces/report-entity.interface';

/**
 * Report DTO
 */
@Exclude()
export class ReportDto
  extends CommonEntityDto
  implements ReportEntityInterface
{
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

  @Expose()
  @ApiProperty({
    enum: ReportStatusEnum,
    enumName: 'ReportStatusEnum',
    description: 'Status of the report',
  })
  @IsEnum(ReportStatusEnum)
  status = ReportStatusEnum.Processing;

  // TODO: maybe we do not need this, since we gonna have the file reference
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
