import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
/**
 * Update one resource filter shortcut
 */
export declare const AccessControlUpdateOne: (resource: string, paramFilter: AccessControlFilterCallback) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol | undefined, descriptor?: TypedPropertyDescriptor<Y> | undefined) => void;
