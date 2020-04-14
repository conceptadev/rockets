import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
/**
 * Delete one resource filter shortcut
 */
export declare const AccessControlDeleteOne: (resource: string, paramFilter: AccessControlFilterCallback) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol | undefined, descriptor?: TypedPropertyDescriptor<Y> | undefined) => void;
