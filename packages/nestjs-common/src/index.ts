export {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@golevelup/nestjs-modules';

export { OptionsInterface } from './interfaces/options/options.interface';

export {
  IdentityEmail,
  IdentityReference,
  IdentitySubject,
  IdentityUsername,
} from './identity/identity.types';

export { IdentityEmailInterface } from './interfaces/identity/identity-email.interface';
export { IdentityReferenceInterface } from './interfaces/identity/identity-reference.interface';
export { IdentityUsernameInterface } from './interfaces/identity/identity-username.interface';
export { IdentitySubjectInterface } from './interfaces/identity/identity-subject.interface';

export { LookupEmailInterface } from './interfaces/lookup/lookup-email.interface';
export { LookupReferenceInterface } from './interfaces/lookup/lookup-reference.interface';
export { LookupSubjectInterface } from './interfaces/lookup/lookup-subject.interface';
export { LookupUsernameInterface } from './interfaces/lookup/lookup-username.interface';

export { ModuleOptionsControllerInterface } from './interfaces/modules/module-options-controller.interface';
export { ModuleOptionsSettingsInterface } from './interfaces/modules/module-options-settings.interface';
export { DeferExternalOptionsInterface } from './interfaces/modules/defer-external-options.interface';

export { deferExternal } from './modules/defer-external';
export { negotiateController } from './modules/negotiate-controller';
