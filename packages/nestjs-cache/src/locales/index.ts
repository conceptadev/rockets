import { I18nLocalesInterface } from '@concepta/i18n';
import enUS from './en/CacheModule';
import ptBR from './pt/CacheModule';

const LOCALES: I18nLocalesInterface[] = [
  {
    namespace: 'CacheModule',
    language: 'en',
    resource: enUS,
  },
  {
    namespace: 'CacheModule',
    language: 'pt',
    resource: ptBR,
  },
];

export default LOCALES;
