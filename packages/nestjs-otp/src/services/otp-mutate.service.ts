import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MutateService } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { OtpMutateServiceInterface } from '../interfaces/otp-mutate-service.interface';
import { OtpCreatableInterface } from '../interfaces/otp-creatable.interface';
import { OtpUpdatableInterface } from '../interfaces/otp-updatable.interface';
import { OtpCreateDto } from '../dto/otp-create.dto';
import { OtpUpdateDto } from '../dto/otp-update.dto';
import { OTP_MODULE_OTP_ENTITY_KEY } from '../otp.constants';
import { OtpInterface } from '../interfaces/otp.interface';

/**
 * TODO: how to inject this dynamically based on context? Otp mutate service
 */
@Injectable()
export class OtpMutateService
  extends MutateService<
    OtpInterface,
    OtpCreatableInterface,
    OtpUpdatableInterface
  >
  implements OtpMutateServiceInterface
{
  protected createDto = OtpCreateDto;
  protected updateDto = OtpUpdateDto;

  /**
   * Constructor
   *
   * @param repo instance of the otp repo
   */
  constructor(
    @InjectDynamicRepository(OTP_MODULE_OTP_ENTITY_KEY)
    protected repo: Repository<OtpInterface>,
  ) {
    super(repo);
  }
}
