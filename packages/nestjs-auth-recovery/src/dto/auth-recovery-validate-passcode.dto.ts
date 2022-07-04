import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AuthRecoveryValidatePasscodeDto {
  @ApiProperty({
    title: 'User passcode',
    description: 'User passcode used to verify if it valid or not.',
  })
  @IsEmail()
  passcode = '';
}
