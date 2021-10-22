import { Abstract, DynamicModule, ForwardReference, Type } from "@nestjs/common";
import { AuthenticationConfigOptionsInterface } from "./authentication-config-options.interface";
import { CredentialLookupServiceInterface } from "./service/credential-lookup.service.interface";

export interface CredentialLookupProvider {
    imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
    /**
    * Factory function that returns an instance of the provider to be injected.
    */
    useFactory: (...args: any[]) => Promise<CredentialLookupServiceInterface> | CredentialLookupServiceInterface ;
    /**
     * Optional list of providers to be injected into the context of the Factory function.
     */
    inject?: Array<Type<any> | string | symbol | Abstract<any> | Function>;
     
}
/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface {
    credentialLookupService: CredentialLookupServiceInterface,
    config?: AuthenticationConfigOptionsInterface
}

export interface AuthenticationOptionsAsyncInterface {
    credentialLookupProvider: CredentialLookupProvider,
    config?: AuthenticationConfigOptionsInterface
}
