"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
/**
 * Define access filters required for this route.
 */
exports.AccessControlFilter = (...acFilters) => {
    return common_1.SetMetadata(constants_1.ACCESS_CONTROL_FILTERS_CONFIG_KEY, acFilters);
};
//# sourceMappingURL=access-control-filter.decorator.js.map