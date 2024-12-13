import { Injectable } from '@nestjs/common';
import {
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';
import { AuthJwtUserLookupServiceInterface } from '../../interfaces/auth-jwt-user-lookup-service.interface';

@Injectable()
export class UserLookupServiceFixture
  implements AuthJwtUserLookupServiceInterface
{
  async bySubject(subject: ReferenceSubject): Promise<ReferenceIdInterface> {
    throw new Error(`Method not implemented, cant get ${subject}.`);
  }
}
