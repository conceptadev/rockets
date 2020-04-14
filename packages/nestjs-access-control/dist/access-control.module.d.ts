import { DynamicModule } from '@nestjs/common';
import { AccessControlModuleOptions } from './interfaces';
export declare class AccessControlModule {
    /**
     * Register a pre-defined roles
     * @param {RolesBuilder} accessControl  A list containing the access grant
     * @param {ACOptions} options  A configurable options
     * definitions. See the structure of this object in the examples.
     */
    static register(options: AccessControlModuleOptions): DynamicModule;
}
