import { AuthHistoryInterface, CommonEntityDto } from '@concepta/nestjs-common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

/**
 * AuthHistory DTO
 */
@Exclude()
export class AuthHistoryDto
  extends CommonEntityDto
  implements AuthHistoryInterface
{
  /**
   * User ID
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'User ID',
  })
  @IsString()
  userId: string = '';

  /**
   * IP Address
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'IP Address',
  })
  @IsString()
  ipAddress: string = '';

  /**
   * Auth Type
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Auth Type',
  })
  @IsString()
  authType: string = '';

  /**
   * Device Info
   */
  @Expose()
  @ApiPropertyOptional({
    type: 'string',
    description: 'Device Info',
  })
  @IsOptional()
  deviceInfo?: string;
}
