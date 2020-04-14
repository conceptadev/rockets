"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const enums_1 = require("accesscontrol/lib/enums");
const constants_1 = require("./constants");
const inject_access_control_decorator_1 = require("./decorators/inject-access-control.decorator");
let AccessControlGuard = class AccessControlGuard {
    constructor(accessControl, reflector, moduleRef) {
        this.accessControl = accessControl;
        this.reflector = reflector;
        this.moduleRef = moduleRef;
    }
    async canActivate(context) {
        // check roles
        const hasPermission = await this.checkAccessGrants(context);
        // have permission?
        if (hasPermission !== true) {
            // no permission, skip remaining checks
            return false;
        }
        // now we have to check access filters
        return this.checkAccessFilters(context);
    }
    async checkAccessGrants(context) {
        const acGrants = this.reflector.get(constants_1.ACCESS_CONTROL_GRANT_CONFIG_KEY, context.getHandler());
        // get anything?
        if (!acGrants || !Array.isArray(acGrants)) {
            // no, nothing to check
            return true;
        }
        const userRoles = await this.getUserRoles(context);
        // do they have at least one ANY permission?
        const hasAnyPermission = acGrants.some(acGrant => {
            const query = {
                role: userRoles,
                possession: enums_1.Possession.ANY,
                ...acGrant,
            };
            const permission = this.accessControl.rules.permission(query);
            return permission.granted;
        });
        // have a match?
        if (true === hasAnyPermission) {
            // yes, we are done here
            return true;
        }
        const hasOwnPermission = acGrants.some(acGrant => {
            const query = {
                role: userRoles,
                possession: enums_1.Possession.OWN,
                ...acGrant,
            };
            const permission = this.accessControl.rules.permission(query);
            return permission.granted;
        });
        // have a match?
        return hasOwnPermission;
    }
    async checkAccessFilters(context) {
        // get access filters configuration for handler
        const acFilters = this.reflector.get(constants_1.ACCESS_CONTROL_FILTERS_CONFIG_KEY, context.getHandler());
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
            }
            else {
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
    getModuleService() {
        return this.moduleRef.get(this.accessControl.service, { strict: false });
    }
    getFilterService(context) {
        const controllerClass = context.getClass();
        const config = this.reflector.get(constants_1.ACCESS_CONTROL_CTLR_CONFIG_KEY, controllerClass);
        return this.moduleRef.get(config.service);
    }
    async getUser(context) {
        return this.getModuleService().getUser(context);
    }
    async getUserRoles(context) {
        return this.getModuleService().getUserRoles(context);
    }
};
AccessControlGuard = __decorate([
    common_1.Injectable(),
    __param(0, inject_access_control_decorator_1.InjectAccessControl()),
    __metadata("design:paramtypes", [Object, core_1.Reflector,
        core_1.ModuleRef])
], AccessControlGuard);
exports.AccessControlGuard = AccessControlGuard;
//# sourceMappingURL=access-control.guard.js.map