import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { LiteralObject } from '@concepta/nestjs-common';

@Expose()
export class TempClass {
  @Expose()
  @IsString()
  @ApiProperty()
  name!: string;
}

@Exclude()
export class InvitationCreateDto {
  @Expose()
  @ApiProperty({
    title: 'user email',
    type: 'string',
    description: 'Email that the invitation will be sent to',
  })
  @IsEmail()
  email = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description:
      'Category of invitation that refers the following table name: user, org...',
  })
  @IsString()
  category = '';

  @Expose()
  @ApiPropertyOptional({
    title: 'Payload',
    type: 'object',
    description:
      'payload content that will be passed through another module ir order to complete the invitation. This payload will have necessary info to target module complete the invitation e.g. new password or what ever required info. The object not have any strong type defined on purpose because the target moules will have object different signatures',
  })
  @IsObject()
  @IsOptional()
  payload?: LiteralObject;
}
