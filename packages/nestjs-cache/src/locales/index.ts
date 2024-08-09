import { LocalesInterface } from '@concepta/i18n/dist/interfaces/i18n.interfaces';
import enUS from './en/CacheModule';
import ptBR from './pt/CacheModule';

const LOCALES: LocalesInterface[] = [
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
