
import { LocalesInterface } from "../../../interfaces/i18n-locales.interface";
import { ModuleCFixture } from "../moduleC.module.fixture";
import enUS from "./en/ModuleCFixture";
import ptCR from "./pt/ModuleCFixture";

const LOCALES: LocalesInterface[] = [{
  namespace: ModuleCFixture.name,
  language: 'en',
  resource: enUS,
}, {
  namespace: ModuleCFixture.name,
  language: 'pt',
  resource: ptCR,
}]

export default LOCALES;