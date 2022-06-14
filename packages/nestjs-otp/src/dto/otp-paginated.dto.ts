import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';
import { OtpInterface } from '../interfaces/otp.interface';
import { OtpDto } from './otp.dto';

/**
 * Otp paginated DTO
 */
@Exclude()
export class OtpPaginatedDto extends CrudResponsePaginatedDto<OtpInterface> {
  @Expose()
  @ApiProperty({
    type: OtpDto,
    isArray: true,
    description: 'Array of Otps',
  })
  @Type(() => OtpDto)
  data: OtpDto[] = [];
}
