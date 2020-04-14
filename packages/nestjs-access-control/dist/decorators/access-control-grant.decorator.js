"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
/**
 * Define access control filters required for this route.
 */
exports.AccessControlGrant = (...acFilters) => {
    return common_1.SetMetadata(constants_1.ACCESS_CONTROL_GRANT_CONFIG_KEY, acFilters);
};
//# sourceMappingURL=access-control-grant.decorator.js.map