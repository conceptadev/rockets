import { Injectable } from '@nestjs/common';
import {
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';
import { AuthRefreshUserModelServiceInterface } from '../../interfaces/auth-refresh-user-model-service.interface';

@Injectable()
export class UserModelServiceFixture
  implements AuthRefreshUserModelServiceInterface
{
  async bySubject(subject: ReferenceSubject): Promise<ReferenceIdInterface> {
    throw new Error(`Method not implemented, cant get ${subject}.`);
  }
}
