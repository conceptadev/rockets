import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ReportInterface,
  ReportStatusEnum,
  CommonEntityDto,
} from '@concepta/nestjs-common';

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

  @Expose()
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
    type: 'string',
    description: 'The file id of the report',
  })
  @IsUUID()
  fileId!: string;
}
