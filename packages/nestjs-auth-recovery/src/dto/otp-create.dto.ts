import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { OtpDto } from './otp.dto';

/**
 * Otp Create DTO
 */
@Exclude()
export class OtpCreateDto extends PickType(OtpDto, [
  'category',
  'type',
  'assignee',
]) {}
