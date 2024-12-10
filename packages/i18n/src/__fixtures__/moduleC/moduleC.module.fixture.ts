import { initModuleCTranslation } from './';
import { I18n } from '../../i18n';

// Non-NestJS module
export class ModuleCFixture {
  constructor() {
    initModuleCTranslation();
  }
  translationC() {
    return I18n.translate({
      namespace: ModuleCFixture.name,
      key: 'hello',
      language: 'en',
    });
  }
}
