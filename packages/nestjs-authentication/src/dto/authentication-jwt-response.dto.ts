import { ApiProperty } from '@nestjs/swagger';
import { AuthenticationJwtResponseInterface } from '../interfaces/authentication-jwt-response.interface';

export class AuthenticationJwtResponseDto
  implements AuthenticationJwtResponseInterface
{
  @ApiProperty({
    type: 'string',
    name: 'Access Token',
    description: 'JWT access token to use for request authorization.',
  })
  accessToken: string;

  @ApiProperty({
    type: 'string',
    name: 'Refresh Token',
    description: 'JWT refresh token to use for obtaining a new access token.',
  })
  refreshToken: string;
}
