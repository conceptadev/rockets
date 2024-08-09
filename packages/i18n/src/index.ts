import { I18n } from './i18n';
import { TranslateParams } from './interfaces/i18n-translate-params.interface';

export { I18n } from './i18n';
export { I18nLocalesInterface as LocalesInterface } from './interfaces/i18n-locales.interface';

export const t = (args: TranslateParams) => {
  return I18n.translate(args);
};
