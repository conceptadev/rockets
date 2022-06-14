import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CrudCreateManyDto } from '@concepta/nestjs-crud';
import { OtpCreatableInterface } from '../interfaces/otp-creatable.interface';
import { OtpCreateDto } from './otp-create.dto';

/**
 * Otp DTO
 */
@Exclude()
export class OtpCreateManyDto extends CrudCreateManyDto<OtpCreatableInterface> {
  @Expose()
  @ApiProperty({
    type: OtpCreateDto,
    isArray: true,
    description: 'Array of Otps to create',
  })
  @Type(() => OtpCreateDto)
  @IsArray()
  @ArrayNotEmpty()
  bulk: OtpCreateDto[] = [];
}
