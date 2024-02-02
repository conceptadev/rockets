import { plainToInstance } from 'class-transformer';
import { Inject, Injectable } from '@nestjs/common';
import {
  CanAccess,
  AccessControlContext,
  ActionEnum,
} from '@concepta/nestjs-access-control';
import { UserPasswordService } from './user-password.service';
import { UserPasswordServiceInterface } from '../interfaces/user-password-service.interface';
import { UserDto } from '../dto/user.dto';
import { UserResource } from '../user.types';

@Injectable()
export class UserAccessQueryService implements CanAccess {
  constructor(
    @Inject(UserPasswordService)
    private readonly userPasswordService: UserPasswordServiceInterface,
  ) {}

  async canAccess(context: AccessControlContext): Promise<boolean> {
    return this.canUpdatePassword(context);
  }

  protected async canUpdatePassword(
    context: AccessControlContext,
  ): Promise<boolean> {
    const { resource, action } = context.getQuery();

    if (resource === UserResource.One && action === ActionEnum.UPDATE) {
      const userAuthorizedDto = plainToInstance(UserDto, context.getUser());

      const params = context.getRequest('params');
      const userParamDto = plainToInstance(UserDto, params);

      if (userParamDto.id) {
        return await this.userPasswordService.canUpdate(
          userParamDto,
          userAuthorizedDto,
        );
      }
    }

    // does not apply
    return true;
  }
}
