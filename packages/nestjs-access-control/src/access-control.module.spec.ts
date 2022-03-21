import { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AccessControl } from 'accesscontrol';
import { AccessControlService } from './services/access-control.service';
import { AccessControlModule } from './access-control.module';
import { AccessControlServiceInterface } from './interfaces/access-control-service.interface';

describe('AccessControlModule', () => {
  class TestService implements AccessControlServiceInterface {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUser<T>(context: ExecutionContext): Promise<T> {
      throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUserRoles(context: ExecutionContext): Promise<string | string[]> {
      throw new Error('Method not implemented.');
    }
  }

  describe('register', () => {
    it('should import the dynamic module synchronously', async () => {
      const module = await Test.createTestingModule({
        imports: [
          AccessControlModule.register({
            settings: { rules: new AccessControl() },
          }),
        ],
      }).compile();

      const service = module.get<AccessControlService>(AccessControlService);
      expect(service).toBeInstanceOf(AccessControlService);
    });
  });

  describe('register (custom service)', () => {
    it('should import the dynamic module synchronously', async () => {
      const module = await Test.createTestingModule({
        imports: [
          AccessControlModule.register({
            settings: { rules: new AccessControl() },
            service: TestService,
          }),
        ],
        providers: [TestService],
      }).compile();

      const service = module.get<TestService>(TestService);
      expect(service).toBeInstanceOf(TestService);
    });
  });

  describe('registerAsync', () => {
    it('should import the dynamic module asynchronously', async () => {
      const module = await Test.createTestingModule({
        imports: [
          AccessControlModule.registerAsync({
            useFactory: async () => {
              return {
                settings: { rules: new AccessControl() },
              };
            },
          }),
        ],
      }).compile();

      const service = module.get<AccessControlService>(AccessControlService);
      expect(service).toBeInstanceOf(AccessControlService);
    });
  });

  describe('registerAsync (custom service)', () => {
    it('should import the dynamic module asynchronously', async () => {
      const module = await Test.createTestingModule({
        imports: [
          AccessControlModule.registerAsync({
            useFactory: async () => {
              return {
                settings: { rules: new AccessControl() },
                service: TestService,
              };
            },
          }),
        ],
        providers: [TestService],
      }).compile();

      const service = module.get<TestService>(TestService);
      expect(service).toBeInstanceOf(TestService);
    });
  });
});
