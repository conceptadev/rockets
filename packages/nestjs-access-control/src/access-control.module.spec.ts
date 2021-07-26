import { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AccessControl } from 'accesscontrol';
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
});
