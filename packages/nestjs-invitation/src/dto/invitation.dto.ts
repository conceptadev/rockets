import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LiteralObject, ReferenceIdInterface } from '@concepta/nestjs-common';
import { InvitationInterface } from '@concepta/nestjs-common';
import { CommonEntityDto, ReferenceIdDto } from '@concepta/nestjs-common';
import { ReferenceEmailInterface } from '@concepta/nestjs-common/src';

@Exclude()
export class InvitationDto
  extends CommonEntityDto
  implements InvitationInterface
{
  @Expose()
  @ApiProperty({
    type: 'boolean',
    description: 'True if Invitation is active',
  })
  @IsBoolean()
  active = true;

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Email that the invitation will be sent to',
  })
  @IsEmail()
  email = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Code claim invitation',
  })
  @IsString()
  code = '';

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
  constraints?: LiteralObject;

  @Expose()
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'The owner of the org',
  })
  @Type(() => ReferenceIdDto)
  @ValidateNested()
  user!: ReferenceIdInterface & ReferenceEmailInterface;
}
