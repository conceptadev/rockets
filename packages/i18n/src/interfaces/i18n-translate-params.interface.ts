import { I18nTranslationOptions } from "./i18n.types";

export interface TranslateParams {
  namespace?: string;
  key: string;
  language?: string;
  defaultMessage?: string;
  options?: I18nTranslationOptions;
}