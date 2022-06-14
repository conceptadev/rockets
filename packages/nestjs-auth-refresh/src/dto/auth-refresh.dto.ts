import { Exclude, Expose } from 'class-transformer';
import { IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthRefreshInterface } from '../interfaces/auth-refresh.interface';

@Exclude()
export class AuthRefreshDto implements AuthRefreshInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'JWT access token to use for request authorization.',
  })
  @IsJWT()
  refreshToken = '';
}
