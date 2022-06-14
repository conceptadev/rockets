import { Injectable } from '@nestjs/common';
import { OtpMutateService } from './otp-mutate.service';

/**
 * Default otp mutate service.
 */
@Injectable()
export class DefaultOtpMutateService extends OtpMutateService {}
