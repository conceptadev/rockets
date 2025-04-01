import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';

// Import modules

import { JwtModule, JwtService } from './jwt';
import { AuthJwtModule } from './auth-jwt';
import { AuthRefreshModule } from './refresh';

// Import services
import { VerifyTokenService } from './jwt/services/verify-token.service';
import { IssueTokenService } from './jwt/services/issue-token.service';
import { JwtIssueTokenService } from './jwt/services/jwt-issue-token.service';
import { JwtVerifyTokenService } from './jwt/services/jwt-verify-token.service';
import { AuthJwtStrategy } from './auth-jwt/auth-jwt.strategy';
import { AuthJwtGuard } from './auth-jwt/auth-jwt.guard';
import { AuthRefreshStrategy } from './refresh/auth-refresh.strategy';
import { AuthRefreshGuard } from './refresh/auth-refresh.guard';
import { AuthRefreshController } from './refresh/auth-refresh.controller';

// Import fixtures
import { GlobalModuleFixture } from './__fixtures__/global.module.fixture';
import { VerifyTokenServiceFixture } from './__fixtures__/services/verify-token.service.fixture';
import { IssueTokenServiceFixture } from './__fixtures__/services/issue-token.service.fixture';
import { ValidateTokenServiceFixture } from './__fixtures__/services/validate-token.service.fixture';

// Import interfaces
import { AuthenticationCombinedOptionsInterface } from './core/interfaces/authentication-combined-options.interface';

// Import constants
import { JWT_MODULE_SETTINGS_TOKEN } from './jwt/jwt.constants';
import { AUTHENTICATION_MODULE_SETTINGS_TOKEN } from './core/authentication.constants';
import { AUTH_JWT_MODULE_SETTINGS_TOKEN } from './auth-jwt/auth-jwt.constants';
import { AUTH_REFRESH_MODULE_SETTINGS_TOKEN } from './refresh/auth-refresh.constants';
import { AuthenticationCoreModule } from './authentication-core.module';
import { AuthenticationModule } from './authentication.module';

// Mock user lookup service
const mockUserLookupService = {
  findOne: jest.fn().mockResolvedValue({ id: '1', username: 'test' }),
  bySubject: jest.fn().mockResolvedValue({ id: '1', username: 'test' }),
};

// Mock configuration module
@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'jwt.secret') return 'test-secret';
          if (key === 'jwt.expiresIn') return '1h';
          return null;
        }),
      },
    },
  ],
  exports: [ConfigService],
})
class MockConfigModule {}

// Test module factory function matching the pattern used in other authentication specs
function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [GlobalModuleFixture, MockConfigModule, JwtModule.forRoot({}), ...extraImports],
  };
}

describe('AuthenticationCombinedImportModule Integration', () => {
  // Helper function to load and assign variables
  function commonVars(testModule: TestingModule) {
    // JWT services
    const jwtService = testModule.get(JwtService);
    const verifyTokenService = testModule.get(VerifyTokenService);
    const issueTokenService = testModule.get(IssueTokenService);
    const jwtIssueTokenService = testModule.get(JwtIssueTokenService);
    const jwtVerifyTokenService = testModule.get(JwtVerifyTokenService);

    // Auth JWT services
    const authJwtStrategy = testModule.get(AuthJwtStrategy);
    const authJwtGuard = testModule.get(AuthJwtGuard);
    
    // Auth Refresh services
    const authRefreshStrategy = testModule.get(AuthRefreshStrategy);
    const authRefreshGuard = testModule.get(AuthRefreshGuard);
    const authRefreshController = testModule.get(AuthRefreshController);
    
    return {
      jwtService,
      verifyTokenService,
      issueTokenService,
      jwtIssueTokenService,
      jwtVerifyTokenService,
      authJwtStrategy,
      authJwtGuard,
      authRefreshStrategy,
      authRefreshGuard,
      authRefreshController
    };
  }

  // Common assertions to verify the services are defined
  function commonTests(services: ReturnType<typeof commonVars>, testModule: TestingModule) {
    // Verify JWT services are defined
    expect(services.jwtService).toBeDefined();
    expect(services.verifyTokenService).toBeDefined();
    expect(services.issueTokenService).toBeDefined();
    expect(services.jwtIssueTokenService).toBeDefined();
    expect(services.jwtVerifyTokenService).toBeDefined();
    
    // Verify Auth JWT services
    expect(services.authJwtStrategy).toBeDefined();
    expect(services.authJwtGuard).toBeDefined();
    
    // Verify Auth Refresh services
    expect(services.authRefreshStrategy).toBeDefined();
    expect(services.authRefreshGuard).toBeDefined();
    expect(services.authRefreshController).toBeDefined();
    
    // Verify the main module is properly instantiated
    expect(testModule.get(AuthenticationModule)).toBeDefined();
  }

  describe('forRootAsync with import strategy', () => {
    let testModule: TestingModule;
    
    it('should define all required services and modules', async () => {
      // Create test module with forRootAsync registration
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthenticationModule.forRootAsync({
            imports: [MockConfigModule],
            inject: [
              ConfigService, 
              VerifyTokenServiceFixture,
              IssueTokenServiceFixture,
              ValidateTokenServiceFixture,
            ],
            useFactory: (
              configService: ConfigService,
              verifyTokenService: VerifyTokenServiceFixture,
              issueTokenService: IssueTokenServiceFixture,
              validateTokenService: ValidateTokenServiceFixture,
            ): AuthenticationCombinedOptionsInterface => ({
              jwt: {
                settings: {
                  access: { secret: configService.get('jwt.secret') },
                  default: { secret: configService.get('jwt.secret') },
                  refresh: { secret: configService.get('jwt.secret') },
                },
              },
              services: {
                userLookupService: mockUserLookupService,
                verifyTokenService,
                issueTokenService,
                validateTokenService,
              }
            }),
          }),
        ])
      ).compile();
      
      // Get services and run common tests
      const services = commonVars(testModule);
      commonTests(services, testModule);
      
      // Additional tests specific to async registration
      expect(testModule.get(ConfigService)).toBeDefined();
      
      // Verify that the verifyTokenService is an instance of VerifyTokenService
      const vts = testModule.get(VerifyTokenService);
      expect(vts).toBeInstanceOf(VerifyTokenService);
    });
  });

  describe('forRoot (sync) with direct options', () => {
    let testModule: TestingModule;
    
    it('should define all required services and modules', async () => {
      // Create test module with forRoot registration
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthenticationModule.forRoot({
            jwt: {
              settings: {
                access: { secret: 'test-secret-forroot' },
                default: { secret: 'test-secret-forroot' },
                refresh: { secret: 'test-secret-forroot' },
              },
            },
            services: {
              userLookupService: mockUserLookupService,
              verifyTokenService: new VerifyTokenServiceFixture(),
              issueTokenService: new IssueTokenServiceFixture(),
              validateTokenService: new ValidateTokenServiceFixture(),
            }
          }),
        ])
      ).compile();
      
      // Get services and run common tests
      const services = commonVars(testModule);
      commonTests(services, testModule);
      
      // Additional tests specific to sync registration
      // Verify that services are properly injected with the correct settings
      const settings = testModule.get(JWT_MODULE_SETTINGS_TOKEN);
      expect(settings).toBeDefined();
      expect(settings.access.secret).toBe('test-secret-forroot');
      expect(settings.default.secret).toBe('test-secret-forroot');
      expect(settings.refresh.secret).toBe('test-secret-forroot');
    });
  });
}); 