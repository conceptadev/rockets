import { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AccessControl } from 'accesscontrol';
import { AccessControlDefaultService } from './access-control-default.service';
import { AccessControlModule } from './access-control.module';
import { AccessControlModuleOptions } from './interfaces/access-control-module-options.interface';
import { AccessControlService } from './interfaces/access-control-service.interface';

describe('AccessControlModule', () => {
  class TestService implements AccessControlService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUser<T>(context: ExecutionContext): Promise<T> {
      throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUserRoles(context: ExecutionContext): Promise<string | string[]> {
      throw new Error('Method not implemented.');
    }
  }

  let configPlain: AccessControlModuleOptions;

  beforeEach(async () => {
    configPlain = {
      rules: new AccessControl(),
      service: TestService,
    };
  });

  describe('register', () => {
    it('should import the dynamic module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AccessControlModule.register(configPlain)],
      }).compile();

      const testService = moduleRef.get<TestService>(TestService);

      expect(testService).toBeInstanceOf(TestService);
    });
  });

  describe('default', () => {
    it('should import the dynamic module synchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AccessControlModule],
      }).compile();

      const accessModuleService = moduleRef.get<AccessControlDefaultService>(
        AccessControlDefaultService,
      );
      expect(accessModuleService).toBeInstanceOf(AccessControlDefaultService);
    });
  });

  describe('forRoot', () => {
    it('should import the dynamic module synchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AccessControlModule.forRoot(configPlain)],
      }).compile();

      const accessModuleService = moduleRef.get<AccessControlDefaultService>(
        AccessControlDefaultService,
      );
      expect(accessModuleService).toBeInstanceOf(AccessControlDefaultService);
    });
  });

  describe('forRootAsync (no injection)', () => {
    it('should import the dynamic module asynchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AccessControlModule.forRootAsync({
            useFactory: async () => {
              return configPlain;
            },
          }),
        ],
      }).compile();

      const accessModuleService = moduleRef.get<AccessControlDefaultService>(
        AccessControlDefaultService,
      );
      expect(accessModuleService).toBeInstanceOf(AccessControlDefaultService);
    });
  });

  //TODO: check
  describe('forRootAsync (with injection)', () => {
    it('should import the dynamic module asynchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [],
      }).compile();
    });
  });
});
