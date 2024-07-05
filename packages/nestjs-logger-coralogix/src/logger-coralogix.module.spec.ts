import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerCoralogixModule } from './logger-coralogix.module';
import { LoggerCoralogixTransport } from './transports/logger-coralogix.transport';
import { LoggerCoralogixConfigInterface } from './interfaces/logger-coralogix-config.interface';
import { LoggerCoralogixSettingsInterface } from './interfaces/logger-coralogix-settings.interface';

describe(LoggerCoralogixModule, () => {
  const transportConfig: LoggerCoralogixConfigInterface = {
    privateKey: '',
    category: 'testers',
    logLevelMap: jest.fn().mockReturnValue(3),
  };
  const transportSettings: LoggerCoralogixSettingsInterface = {
    transportConfig,
    logLevel: ['error'],
  }

  let testModule: TestingModule;
  let loggerCoralogixModule: LoggerCoralogixModule;
  let loggerCoralogixTransport: LoggerCoralogixTransport;
  
  describe(LoggerCoralogixModule.forRoot, () => {
   
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([LoggerCoralogixModule.forRoot({
          settings: transportSettings
        })]),
      ).compile();
    });

    it.only('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(LoggerCoralogixModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([LoggerCoralogixModule.register({
          settings: transportSettings
        })]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(LoggerCoralogixModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          LoggerCoralogixModule.forRootAsync({
            useFactory: () => ({
              settings: transportSettings
            }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(LoggerCoralogixModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          LoggerCoralogixModule.registerAsync({
            useFactory: () => ({
              settings: transportSettings
            }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  function commonVars() {
    loggerCoralogixModule = testModule.get(LoggerCoralogixModule);    
    loggerCoralogixTransport = testModule.get(LoggerCoralogixTransport);
  }

  function commonTests() {
    expect(loggerCoralogixModule).toBeInstanceOf(LoggerCoralogixModule);
    expect(loggerCoralogixTransport).toBeInstanceOf(LoggerCoralogixTransport);
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [...extraImports],
  };
}
