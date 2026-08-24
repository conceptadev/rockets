import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RocketsAuthChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    title: 'Current Password',
    type: 'string',
    description: 'The user current password for verification',
    example: 'CurrentP@ssw0rd',
  })
  currentPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty({
    title: 'New Password',
    type: 'string',
    description: 'The new password to set (minimum 8 characters)',
    example: 'NewSecureP@ssw0rd',
    minLength: 8,
  })
  newPassword!: string;
}
