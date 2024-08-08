import { initModuleBTranslation } from "./";
import { I18n } from "../../i18n";
import { ModuleCFixture, initModuleCTranslation } from "../moduleC";

// Non-NestJS module
export class ModuleBFixture {
  constructor(private moduleC: ModuleCFixture) {
    initModuleBTranslation();
    initModuleCTranslation();
  }
  translationB() {
     return I18n.translate({ namespace: ModuleBFixture.name, key: 'hello', language: 'en' });
  }

  translationC() {
    return I18n.translate({ namespace: ModuleCFixture.name, key: 'hello', language: 'en' });
  }
}