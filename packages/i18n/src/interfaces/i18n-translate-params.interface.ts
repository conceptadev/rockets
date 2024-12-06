import { I18nTranslationKeys } from './i18n-translation-keys.interface copy';
import { I18nTranslationOptions } from './i18n.types';

export interface TranslateParams extends I18nTranslationKeys {
  // TODO: change default message to inside options.defaultValue
  defaultMessage?: string;
  options?: I18nTranslationOptions;
}
