import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GithubLoginInterface } from '../interfaces/github-login.interface';

@Exclude()
export class GithubLoginDto implements GithubLoginInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Code returned from github',
  })
  @IsString()
  code: string;
}
