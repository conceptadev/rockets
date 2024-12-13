import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuthenticationCodeInterface } from '@concepta/nestjs-common';

@Exclude()
export class AuthAppleLoginDto implements AuthenticationCodeInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Code returned from apple',
  })
  @IsString()
  code = '';
}
