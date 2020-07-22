import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Possession } from 'accesscontrol/lib/enums';
import { AccessControlFilterOption } from './interfaces/access-control-filter-option.interface';
import { AccessControlGrantOption } from './interfaces/access-control-grant-option.interface';
import { AccessControlFilterService } from './interfaces/access-control-filter-service.interface';
import {
  ACCESS_CONTROL_CTLR_CONFIG_KEY,
  ACCESS_CONTROL_FILTERS_CONFIG_KEY,
  ACCESS_CONTROL_GRANT_CONFIG_KEY,
} from './constants';
import { InjectAccessControl } from './decorators/inject-access-control.decorator';
import { AccessControlModuleOptions, AccessControlService } from './interfaces';
import { IQueryInfo } from 'accesscontrol';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    @InjectAccessControl()
    private readonly accessControl: AccessControlModuleOptions,
    private readonly reflector: Reflector,
    private moduleRef: ModuleRef
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // check permissions
    return this.checkAccessGrants(context);
  }

  protected async checkAccessGrants(
    context: ExecutionContext
  ): Promise<boolean> {
    const acGrants = this.reflector.get<AccessControlGrantOption[]>(
      ACCESS_CONTROL_GRANT_CONFIG_KEY,
      context.getHandler()
    );

    // get anything?
    if (!acGrants || !Array.isArray(acGrants)) {
      // no, nothing to check
      return true;
    }

    const userRoles = await this.getUserRoles(context);

    // do they have at least one ANY permission?
    const hasAnyPermission = acGrants.some(acGrant => {
      const query: IQueryInfo = {
        role: userRoles,
        possession: Possession.ANY,
        ...acGrant,
      };
      const permission = this.accessControl.rules.permission(query);
      return permission.granted;
    });

    // have a match?
    if (true === hasAnyPermission) {
      // yes, skip remaining checks (even filters)
      return true;
    }

    const hasOwnPermission = acGrants.some(acGrant => {
      const query: IQueryInfo = {
        role: userRoles,
        possession: Possession.OWN,
        ...acGrant,
      };
      const permission = this.accessControl.rules.permission(query);
      return permission.granted;
    });

    // have a match?
    if (hasOwnPermission) {
      // yes, now we have to check filters
      return this.checkAccessFilters(context);
    } else {
      // no access
      return false;
    }
  }

  protected async checkAccessFilters(
    context: ExecutionContext
  ): Promise<boolean> {
    // get access filters configuration for handler
    const acFilters = this.reflector.get<AccessControlFilterOption[]>(
      ACCESS_CONTROL_FILTERS_CONFIG_KEY,
      context.getHandler()
    );

    // get anything?
    if (!acFilters || !Array.isArray(acFilters)) {
      // no, nothing to check
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const service = this.getFilterService(context);
    const user = await this.getUser(context);
    let authorized = true;

    for (const acFilter of acFilters) {
      // maybe apply
      if (req[acFilter.type]) {
        authorized = await acFilter.filter(req[acFilter.type], user, service);
      } else {
        // no parameters found on request?!
        // impossible to apply filter
        authorized = false;
      }

      // lost access?
      if (authorized !== true) {
        // yes, don't bother checking anything else
        break;
      }
    }

    return authorized;
  }

  private getModuleService(): AccessControlService {
    return this.moduleRef.get(this.accessControl.service, { strict: false });
  }

  private getFilterService(
    context: ExecutionContext
  ): AccessControlFilterService {
    const controllerClass = context.getClass();
    const config = this.reflector.get(
      ACCESS_CONTROL_CTLR_CONFIG_KEY,
      controllerClass
    );
    return this.moduleRef.get(config.service);
  }

  private async getUser<T>(context: ExecutionContext): Promise<T> {
    return this.getModuleService().getUser<T>(context);
  }

  private async getUserRoles(
    context: ExecutionContext
  ): Promise<string | string[]> {
    return this.getModuleService().getUserRoles(context);
  }
}
