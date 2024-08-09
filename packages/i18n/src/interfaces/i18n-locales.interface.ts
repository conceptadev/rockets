import { I18nTranslationKeys } from './i18n-translation-keys.interface copy';

/**
 * Interface representing the structure of localization data.
 */
export interface I18nLocalesInterface
  extends Partial<Pick<I18nTranslationKeys, 'namespace' | 'language'>> {
  /**
   * A record of localization keys and their corresponding translations.
   */
  resource: Record<string, string>;

  /**
   * Optional flag indicating whether the localization should be extends the other resources.
   */
  deep?: boolean;

  /**
   * Optional flag indicating whether the localization should overwrite existing keys.
   */
  overwrite?: boolean;
}
