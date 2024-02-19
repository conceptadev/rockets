import { plainToInstance } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import {
  CanAccess,
  AccessControlContext,
  ActionEnum,
} from '@concepta/nestjs-access-control';
import { UserDto } from '../dto/user.dto';
import { UserPasswordDto } from '../dto/user-password.dto';
import { UserResource } from '../user.types';

@Injectable()
export class UserAccessQueryService implements CanAccess {
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

      const body = context.getRequest('body');
      const userPasswordDto = plainToInstance(UserPasswordDto, body);

      if (userParamDto.id && userPasswordDto?.password) {
        return userParamDto.id === userAuthorizedDto.id;
      }
    }

    // does not apply
    return true;
  }
}
