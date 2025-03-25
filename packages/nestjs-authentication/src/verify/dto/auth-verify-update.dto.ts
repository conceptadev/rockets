import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthVerifyUpdateDto {
  @ApiProperty({
    title: 'account confirm passcode',
    type: 'string',
    description: 'Passcode used to confirm account',
  })
  @IsString()
  passcode = '';
}
