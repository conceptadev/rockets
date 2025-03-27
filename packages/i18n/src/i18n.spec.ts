import I18NexFsBackend, { FsBackendOptions } from 'i18next-fs-backend';
import { join } from 'path';
import { ModuleAFixture } from './__fixtures__/moduleA';
import { ModuleBFixture } from './__fixtures__/moduleB';
import { ModuleCFixture } from './__fixtures__/moduleC';
import { I18n } from './i18n';
import { I18nLocalesInterface } from './interfaces/i18n-locales.interface';
import { t } from './';

describe('i18n module', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should not initialize ', () => {
    const LOCALES: I18nLocalesInterface[] = [
      {
        namespace: 'my-namespace',
        language: 'en',
        resource: require(__dirname +
          '/__fixtures__/locales/en/my-namespace.json'),
      },
    ];

    const consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValueOnce();

    I18n.addTranslations(LOCALES);
    expect(consoleErrorSpy).toBeCalledWith(
      'i18next was not isInitialized, please call init',
    );
  });

  describe('i18n configuration', () => {
    afterEach(() => {
      I18n.reset();
    });

    it('should initialize translations from constant', async () => {
      const enUS = {
        hello: 'Hi',
      };

      const ptBR = {
        hello: 'Olá',
      };

      // TODO: maybe the interface can be improved
      const LOCALES: I18nLocalesInterface[] = [
        {
          namespace: 'my-namespace',
          language: 'en',
          resource: enUS,
        },
        {
          namespace: 'my-namespace',
          language: 'pt',
          resource: ptBR,
        },
      ];
      I18n.init({
        options: {
          initImmediate: false,
        },
      });
      I18n.addTranslations(LOCALES);

      const enTranslation = I18n.translate({
        namespace: 'my-namespace',
        key: 'hello',
        language: 'en',
      });
      const ptTranslation = I18n.translate({
        namespace: 'my-namespace',
        key: 'hello',
        language: 'pt',
      });

      expect(enTranslation).toBe('Hi');
      expect(ptTranslation).toBe('Olá');
    });

    it('should initialize translations from json', async () => {
      const LOCALES: I18nLocalesInterface[] = [
        {
          namespace: 'my-namespace',
          language: 'en',
          resource: require(__dirname +
            '/__fixtures__/locales/en/my-namespace.json'),
        },
        {
          namespace: 'my-namespace',
          language: 'pt',
          resource: require(__dirname +
            '/__fixtures__/locales/pt/my-namespace.json'),
        },
      ];

      I18n.init({
        options: {
          initImmediate: false,
        },
      });
      I18n.addTranslations(LOCALES);

      const enTranslation = I18n.translate({
        namespace: 'my-namespace',
        key: 'hello',
        language: 'en',
      });
      const ptTranslation = I18n.translate({
        namespace: 'my-namespace',
        key: 'hello',
        language: 'pt',
      });

      expect(enTranslation).toBe('Hi');
      expect(ptTranslation).toBe('Olá');
    });

    it('should initialize translations from constant', async () => {
      I18n.init({
        options: {
          resources: {
            en: {
              translation: {
                hello: 'Hi',
              },
            },
            pt: {
              translation: {
                hello: 'Olá',
              },
            },
          },
        },
      });

      const enTranslation = t({ key: 'hello' });
      const ptTranslation = t({ key: 'hello', language: 'pt' });

      expect(enTranslation).toBe('Hi');
      expect(ptTranslation).toBe('Olá');
    });

    it('should initialize translations from constant changing language', async () => {
      I18n.init({
        options: {
          resources: {
            en: {
              translation: {
                hello: 'Hi',
              },
            },
            pt: {
              translation: {
                hello: 'Olá',
              },
            },
          },
        },
      });

      const enTranslation = t({ key: 'hello' });
      expect(enTranslation).toBe('Hi');

      I18n.changeLanguage('pt');

      const ptTranslation = t({ key: 'hello' });
      expect(ptTranslation).toBe('Olá');
    });

    it('should initialize translations from settings', async () => {
      I18n.init<FsBackendOptions>({
        modules: [I18NexFsBackend],
        options: {
          initImmediate: false,
          ns: ['translation', 'my-namespace'],
          backend: {
            loadPath: join(
              __dirname,
              './__fixtures__/locales/{{lng}}/{{ns}}.json',
            ),
          },
          supportedLngs: ['en', 'pt'],
          preload: ['en', 'pt'],
          fallbackLng: 'en',
        },
      });

      const enTranslation = t({
        namespace: 'my-namespace',
        key: 'hello',
        language: 'en',
      });
      const ptTranslation = t({
        namespace: 'my-namespace',
        key: 'hello',
        language: 'pt',
      });
      const defaultEnTranslation = t({
        namespace: 'translation',
        key: 'hello',
        language: 'en',
      });
      const defaultPtTranslation = t({
        namespace: 'translation',
        key: 'hello',
        language: 'pt',
      });

      expect(enTranslation).toBe('Hi');
      expect(ptTranslation).toBe('Olá');
      expect(defaultEnTranslation).toBe('Hi from translation');
      expect(defaultPtTranslation).toBe('Olá do translation');
    });
  });

  describe('ModuleAFixture E2E', () => {
    let moduleA: ModuleAFixture;
    let moduleB: ModuleBFixture;
    let moduleC: ModuleCFixture;

    beforeAll(() => {
      // Initialize translations
      I18n.init({
        options: {
          initImmediate: false,
        },
      });

      // Create instances of the modules
      moduleB = new ModuleBFixture(new ModuleCFixture());
      moduleC = new ModuleCFixture();
      moduleA = new ModuleAFixture(moduleB, moduleC);
    });

    it('should translate for module A', () => {
      const result = moduleA.translationModuleA();
      expect(result).toBe('Hi from module A');
    });

    it('should translate for module B', () => {
      const result = moduleA.translationModuleB();
      expect(result).toBe('Hi from module B');
    });

    it('should translate C from module B', () => {
      const result = moduleA.translationCFromModuleB();
      expect(result).toBe('Hi from module C');
    });

    it('should translate for module C', () => {
      const result = moduleA.translationC();
      expect(result).toBe('Hi from module C');
    });
  });
});
