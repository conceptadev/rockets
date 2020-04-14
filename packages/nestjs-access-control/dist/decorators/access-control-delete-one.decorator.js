"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const access_control_grant_decorator_1 = require("./access-control-grant.decorator");
const common_1 = require("@nestjs/common");
const access_control_filter_decorator_1 = require("./access-control-filter.decorator");
const access_control_action_enum_1 = require("../enums/access-control-action.enum");
const access_control_filter_type_enum_1 = require("../enums/access-control-filter-type.enum");
/**
 * Delete one resource filter shortcut
 */
exports.AccessControlDeleteOne = (resource, paramFilter) => {
    const acFilter = access_control_grant_decorator_1.AccessControlGrant({
        resource: resource,
        action: access_control_action_enum_1.AccessControlAction.DELETE,
    });
    if (paramFilter) {
        return common_1.applyDecorators(acFilter, access_control_filter_decorator_1.AccessControlFilter({
            type: access_control_filter_type_enum_1.AccessControlFilterType.PATH,
            filter: paramFilter,
        }));
    }
    else {
        return acFilter;
    }
};
//# sourceMappingURL=access-control-delete-one.decorator.js.map