import { I18nLocalesInterface } from '../../../interfaces/i18n-locales.interface';
import { ModuleCFixture } from '../moduleC.module.fixture';
import enUS from './en/ModuleCFixture';
import ptCR from './pt/ModuleCFixture';

const LOCALES: I18nLocalesInterface[] = [
  {
    namespace: ModuleCFixture.name,
    language: 'en',
    resource: enUS,
  },
  {
    namespace: ModuleCFixture.name,
    language: 'pt',
    resource: ptCR,
  },
];

export default LOCALES;
