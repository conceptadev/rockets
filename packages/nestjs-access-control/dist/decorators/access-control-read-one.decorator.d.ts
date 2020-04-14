import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
/**
 * Read one resource filter shortcut
 */
export declare const AccessControlReadOne: (resource: string, paramFilter: AccessControlFilterCallback) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol | undefined, descriptor?: TypedPropertyDescriptor<Y> | undefined) => void;
