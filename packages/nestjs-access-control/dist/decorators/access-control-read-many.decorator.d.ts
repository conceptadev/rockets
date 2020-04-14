import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
/**
 * Read many resource filter shortcut
 */
export declare const AccessControlReadMany: (resource: string, paramFilter?: AccessControlFilterCallback | undefined) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol | undefined, descriptor?: TypedPropertyDescriptor<Y> | undefined) => void;
