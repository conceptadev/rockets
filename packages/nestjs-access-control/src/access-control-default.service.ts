import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AccessControlService } from './interfaces/access-control-service.interface';

interface RoleDefaultInterface {
  name: string;
}

interface UserDefaultInterface {
  userRoles: { role: RoleDefaultInterface }[];
}

export class AccessControlDefaultService implements AccessControlService {
  async getUser<T>(context: ExecutionContext): Promise<T> {
    const request = context.switchToHttp().getRequest();
    return request.user as T;
  }
  async getUserRoles(context: ExecutionContext): Promise<string | string[]> {
    const user = await this.getUser<UserDefaultInterface>(context);
    if (!user || !user.userRoles) throw new UnauthorizedException();
    return user.userRoles.map((userRole) => userRole.role.name);
  }
}
