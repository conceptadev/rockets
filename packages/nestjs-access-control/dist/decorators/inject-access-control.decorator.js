"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
exports.InjectAccessControl = () => common_1.Inject(constants_1.ACCESS_CONTROL_OPTIONS_KEY);
//# sourceMappingURL=inject-access-control.decorator.js.map