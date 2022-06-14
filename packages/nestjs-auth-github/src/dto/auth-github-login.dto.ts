import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuthGithubLoginInterface } from '../interfaces/auth-github-login.interface';

@Exclude()
export class AuthGithubLoginDto implements AuthGithubLoginInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Code returned from github',
  })
  @IsString()
  code = '';
}
