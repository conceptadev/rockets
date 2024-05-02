import { DynamicModule } from "@nestjs/common";
import { ModuleOptionsControllerInterface } from "./interfaces/module-options-controller.interface";
import { negotiateController } from "./negotiate-controller";

class TestController {} // Example controller class for testing

describe(negotiateController.name, () => {
  let moduleMock: DynamicModule;

  beforeEach(() => {
    moduleMock = {
      module: TestController,
      controllers: [],
    };
  });

  it('should remove all controllers if options.controller is false', () => {
    const options: ModuleOptionsControllerInterface = { controller: false };
    negotiateController(moduleMock, options);
    expect(moduleMock.controllers).toEqual([]);
  });

  it('should set a single controller if options.controller is a single controller class', () => {
    const options: ModuleOptionsControllerInterface = {
      controller: TestController,
    };
    negotiateController(moduleMock, options);
    expect(moduleMock.controllers).toEqual([TestController]);
  });

  it('should set multiple controllers if options.controller is an array of controller classes', () => {
    const options: ModuleOptionsControllerInterface = {
      controller: [TestController, TestController],
    };
    negotiateController(moduleMock, options);
    expect(moduleMock.controllers).toEqual([TestController, TestController]);
  });

  it('should not change controllers if options.controller is undefined', () => {
    const initialControllers = [TestController];
    moduleMock.controllers = initialControllers;
    const options: ModuleOptionsControllerInterface = {}; // options.controller is undefined
    negotiateController(moduleMock, options);
    expect(moduleMock.controllers).toBe(initialControllers);
  });
});
