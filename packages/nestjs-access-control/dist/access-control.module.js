"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AccessControlModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
let AccessControlModule = AccessControlModule_1 = class AccessControlModule {
    /**
     * Register a pre-defined roles
     * @param {RolesBuilder} accessControl  A list containing the access grant
     * @param {ACOptions} options  A configurable options
     * definitions. See the structure of this object in the examples.
     */
    static register(options) {
        return {
            module: AccessControlModule_1,
            providers: [
                options.service,
                {
                    provide: constants_1.ACCESS_CONTROL_OPTIONS_KEY,
                    useValue: options,
                },
            ],
            exports: [
                options.service,
                {
                    provide: constants_1.ACCESS_CONTROL_OPTIONS_KEY,
                    useValue: options,
                },
            ],
        };
    }
};
AccessControlModule = AccessControlModule_1 = __decorate([
    common_1.Global(),
    common_1.Module({})
], AccessControlModule);
exports.AccessControlModule = AccessControlModule;
//# sourceMappingURL=access-control.module.js.map