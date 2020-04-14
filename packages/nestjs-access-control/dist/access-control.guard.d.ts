import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { AccessControlModuleOptions } from './interfaces';
export declare class AccessControlGuard implements CanActivate {
    private readonly accessControl;
    private readonly reflector;
    private moduleRef;
    constructor(accessControl: AccessControlModuleOptions, reflector: Reflector, moduleRef: ModuleRef);
    canActivate(context: ExecutionContext): Promise<boolean>;
    protected checkAccessGrants(context: ExecutionContext): Promise<boolean>;
    protected checkAccessFilters(context: ExecutionContext): Promise<boolean>;
    private getModuleService;
    private getFilterService;
    private getUser;
    private getUserRoles;
}
