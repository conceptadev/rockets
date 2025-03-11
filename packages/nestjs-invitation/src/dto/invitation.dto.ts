import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  LiteralObject,
  CommonEntityDto,
  InvitationInterface,
  InvitationUserInterface,
} from '@concepta/nestjs-common';
import { InvitationUserDto } from './invitation-user.dto';

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
  @ApiProperty({
    title: 'Payload',
    type: 'object',
    description:
      'payload content that will be passed through another module ir order to complete the invitation. This payload will have necessary info to target module complete the invitation e.g. new password or what ever required info. The object not have any strong type defined on purpose because the target moules will have object different signatures',
  })
  @IsObject()
  @IsOptional()
  constraints!: LiteralObject;

  @Expose()
  @ApiProperty({
    type: InvitationUserDto,
    description: 'The invited user.',
  })
  @Type(() => InvitationUserDto)
  @ValidateNested()
  user!: InvitationUserInterface;
}
