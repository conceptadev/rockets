import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { OtpUpdatableInterface } from '../interfaces/otp-updatable.interface';
import { OtpDto } from './otp.dto';

/**
 * Otp Update DTO
 */
@Exclude()
export class OtpUpdateDto
  extends PickType(OtpDto, [
    'category',
    'type',
    'passCode',
    'assignee',
  ] as const)
  implements OtpUpdatableInterface {}
