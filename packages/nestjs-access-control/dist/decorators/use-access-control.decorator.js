"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
/**
 * Define access control filters required for this route.
 */
exports.UseAccessControl = (options) => {
    return common_1.SetMetadata(constants_1.ACCESS_CONTROL_CTLR_CONFIG_KEY, options);
};
//# sourceMappingURL=use-access-control.decorator.js.map