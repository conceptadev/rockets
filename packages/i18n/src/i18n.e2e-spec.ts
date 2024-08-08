import { ModuleAFixture } from './__fixtures__/moduleA';
import { ModuleBFixture } from './__fixtures__/moduleB';
import { ModuleCFixture } from './__fixtures__/moduleC';
import { I18n } from './i18n';
import { LocalesInterface } from './interfaces/i18n-locales.interface';

describe('i18n module', () => {
  
  describe('ModuleAFixture E2E', () => {
    let moduleA: ModuleAFixture;
    let moduleB: ModuleBFixture;
    let moduleC: ModuleCFixture;
  
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      // Initialize translations
      I18n.init({
        options: {
          initImmediate: false,
        }
      });
      // Create instances of the modules
      moduleC = new ModuleCFixture();
      moduleB = new ModuleBFixture(new ModuleCFixture());
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

    it('should translate for module C', () => {
      const LOCALES: LocalesInterface[] = [{
        namespace: ModuleCFixture.name,
        resource: {
          'hello': 'overwrite english',
          'hi': 'new hi'
        },
        deep: false,
        overwrite: false
      }];
      I18n.addTranslations(LOCALES);

      const result = moduleA.translationC('hello', 'pt');
      expect(result).toBe('Olá do modulo C');

      const result1 = moduleA.translationC('hello', 'en');
      expect(result1).toBe('overwrite english');
      
      const resultExtend = moduleA.translationC('hi', 'en');
      expect(resultExtend).toBe('new hi');
      
      const resultBye = moduleA.translationC('bye', 'en');
      expect(resultBye).toBe('Bye from module C');
      
    });
  });
});