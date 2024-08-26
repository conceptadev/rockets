import { I18n } from '../../i18n';
import LOCALES from './locales';

let loaded = false;
export const initModuleCTranslation = () => {
  if (!loaded) {
    I18n.addTranslations(LOCALES);
    loaded = true;
  }
};

export * from './moduleC.module.fixture';
