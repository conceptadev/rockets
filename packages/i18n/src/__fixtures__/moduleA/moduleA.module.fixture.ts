import { initModuleATranslation } from './';
import { I18n } from '../../i18n';

import { ModuleBFixture, initModuleBTranslation } from '../moduleB';
import { ModuleCFixture, initModuleCTranslation } from '../moduleC';

// Non-NestJS module
export class ModuleAFixture {
  constructor(
    private moduleB: ModuleBFixture,
    private moduleC: ModuleCFixture,
  ) {
    initModuleATranslation();
    initModuleBTranslation();
    initModuleCTranslation();
  }
  translationModuleA() {
    return I18n.translate({
      namespace: ModuleAFixture.name,
      key: 'hello',
      language: 'en',
    });
  }

  translationModuleB() {
    return I18n.translate({
      namespace: ModuleBFixture.name,
      key: 'hello',
      language: 'en',
    });
  }

  translationCFromModuleB() {
    return this.moduleB.translationC();
  }

  translationC(key: string = 'hello', language: string = 'en') {
    return I18n.translate({
      namespace: ModuleCFixture.name,
      key: key,
      language: language,
    });
  }
}
