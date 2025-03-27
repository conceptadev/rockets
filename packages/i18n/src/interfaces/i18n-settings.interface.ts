import { I18nOptions } from './i18n-options.interface';
import { I18nObjectModule, I18nextModuleType } from './i18n.types';

/**
 * Interface representing the settings for internationalization (i18n).
 */
export interface I18nSettings<T = object> {
  /**
   * An array of i18n modules.
   */
  modules?: I18nextModuleType<I18nObjectModule>[];

  /**
   * Options for configuring i18n.
   */
  options?: I18nOptions<T>;
}
