import { I18nextOptions } from "./i18n-options.interface"
import { I18nObjectModule, i18nextModuleType } from "./i18n.types"

export interface I18Settings<T = object> {
  // TODO: validate this how to receive the other possible types
  // any custom configuration should be under settings
  newInstance?: boolean;
  modules?: i18nextModuleType<I18nObjectModule>[]
  options?: I18nextOptions<T>
}
