import { Injectable } from '@nestjs/common';
import { UserServiceInterface } from '../interfaces/user-service.interface';
import { UserService } from './user.service';

/**
 * Default user service.
 */
@Injectable()
export class DefaultUserService
  extends UserService
  implements UserServiceInterface {}
