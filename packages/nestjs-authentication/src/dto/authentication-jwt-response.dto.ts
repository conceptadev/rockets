import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuthenticationJwtResponseInterface } from '../interfaces/authentication-jwt-response.interface';

@Exclude()
export class AuthenticationJwtResponseDto
  implements AuthenticationJwtResponseInterface
{
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'JWT access token to use for request authorization.',
  })
  accessToken = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'JWT refresh token to use for obtaining a new access token.',
  })
  refreshToken = '';
}
