import { DynamicModule } from '@nestjs/common';
import { OtpEntitiesOptionsInterface } from './otp-entities-options.interface';

export interface OtpOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'>,
    Partial<OtpEntitiesOptionsInterface> {}
