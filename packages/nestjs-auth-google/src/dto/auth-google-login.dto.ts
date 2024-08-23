import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuthenticationCodeInterface } from '@concepta/ts-common';

@Exclude()
export class AuthGoogleLoginDto implements AuthenticationCodeInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Code returned from google',
  })
  @IsString()
  code = '';
}
