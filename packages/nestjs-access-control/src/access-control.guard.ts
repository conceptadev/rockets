import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { IQueryInfo } from 'accesscontrol';
import { Possession } from 'accesscontrol/lib/enums';
import {
  ACCESS_CONTROL_MODULE_CTLR_METADATA,
  ACCESS_CONTROL_MODULE_FILTERS_METADATA,
  ACCESS_CONTROL_MODULE_GRANT_METADATA,
  ACCESS_CONTROL_MODULE_SETTINGS_TOKEN,
} from './constants';
import { AccessControlOptions } from './interfaces/access-control-options.interface';
import { AccessControlFilterOption } from './interfaces/access-control-filter-option.interface';
import { AccessControlGrantOption } from './interfaces/access-control-grant-option.interface';
import { AccessControlServiceInterface } from './interfaces/access-control-service.interface';
import { AccessControlFilterService } from './interfaces/access-control-filter-service.interface';
import { AccessControlSettingsInterface } from './interfaces/access-control-settings.interface';
import { AccessControlService } from './services/access-control.service';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    @Inject(ACCESS_CONTROL_MODULE_SETTINGS_TOKEN)
    private readonly settings: AccessControlSettingsInterface,
    @Inject(AccessControlService)
    private readonly service: AccessControlServiceInterface,
    private readonly reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // check permissions
    return this.checkAccessGrants(context);
  }

  protected async checkAccessGrants(
    context: ExecutionContext,
  ): Promise<boolean> {
    const rules = this.settings.rules;
    const acGrants = this.reflector.get<AccessControlGrantOption[]>(
      ACCESS_CONTROL_MODULE_GRANT_METADATA,
      context.getHandler(),
    );

    // get anything?
    if (!acGrants || !Array.isArray(acGrants)) {
      // no, nothing to check
      return true;
    }

    const userRoles = await this.service.getUserRoles(context);

    // do they have at least one ANY permission?
    const hasAnyPermission = acGrants.some((acGrant) => {
      const query: IQueryInfo = {
        role: userRoles,
        possession: Possession.ANY,
        ...acGrant,
      };
      const permission = rules.permission(query);
      return permission.granted;
    });

    // have a match?
    if (hasAnyPermission) {
      // yes, skip remaining checks (even filters)
      return true;
    }

    const hasOwnPermission = acGrants.some((acGrant) => {
      const query: IQueryInfo = {
        role: userRoles,
        possession: Possession.OWN,
        ...acGrant,
      };
      const permission = rules.permission(query);
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
    context: ExecutionContext,
  ): Promise<boolean> {
    // get access filters configuration for handler
    const acFilters = this.reflector.get<AccessControlFilterOption[]>(
      ACCESS_CONTROL_MODULE_FILTERS_METADATA,
      context.getHandler(),
    );

    // get anything?
    if (!acFilters || !Array.isArray(acFilters)) {
      // no, nothing to check
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const service = this.getFilterService(context);
    const user = await this.service.getUser(context);
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
      if (!authorized) {
        // yes, don't bother checking anything else
        break;
      }
    }

    return authorized;
  }

  private getFilterService(
    context: ExecutionContext,
  ): AccessControlFilterService | undefined {
    const controllerClass = context.getClass();
    const config: AccessControlOptions = this.reflector.get(
      ACCESS_CONTROL_MODULE_CTLR_METADATA,
      controllerClass,
    );

    const finalConfig = { ...config };

    if (finalConfig.service) {
      if (!config.service) {
        throw new Error('access control service is not defined');
      }

      return this.moduleRef.get(config.service);
    } else {
      return;
    }
  }
}
