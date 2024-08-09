import { LocalesInterface } from '@concepta/i18n';
import enUS from './en/translation';
import ptBR from './pt/translation';

// TODO: should we keep this under default namespace?
const LOCALES: LocalesInterface[] = [
  {
    language: 'en',
    resource: enUS,
  },
  {
    language: 'pt',
    resource: ptBR,
  },
];

export default LOCALES;
