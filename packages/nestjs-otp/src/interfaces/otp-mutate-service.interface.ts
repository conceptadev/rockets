import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import { OtpEntityInterface } from './otp-entity.interface';
import { OtpCreatableInterface } from './otp-creatable.interface';
import { OtpUpdatableInterface } from './otp-updatable.interface';

export interface OtpMutateServiceInterface
  extends CreateOneInterface<OtpCreatableInterface, OtpEntityInterface>,
    UpdateOneInterface<
      OtpUpdatableInterface & ReferenceIdInterface,
      OtpEntityInterface
    >,
    ReplaceOneInterface<
      OtpCreatableInterface & ReferenceIdInterface,
      OtpEntityInterface
    >,
    RemoveOneInterface<OtpEntityInterface> {}
