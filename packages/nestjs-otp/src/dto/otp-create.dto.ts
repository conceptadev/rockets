import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { OtpCreatableInterface } from '../interfaces/otp-creatable.interface';
import { OtpDto } from './otp.dto';

/**
 * Otp Create DTO
 */
@Exclude()
export class OtpCreateDto
  extends PickType(OtpDto, ['category', 'type', 'assignee'] as const)
  implements OtpCreatableInterface {}
