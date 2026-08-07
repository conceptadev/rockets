import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';
import {
  AssignRoleCommand,
  GetAssignedRolesQuery,
} from '@concepta/nestjs-role';

import { AdminGuard } from '../../../../../guards/admin.guard';
import { USER_ROLE_ENTITY_KEY } from '../../../../../shared/constants/repository-entity-keys.constants';
import type { AdminUserRolesControllerExtras } from '../../../interfaces/role-controller-extras.interface';
import { applyControllerExtras } from '../../../../../shared/utils/apply-controller-extras.helper';

class AdminAssignUserRoleDto {
  @ApiProperty({
    description: 'Role ID to assign to the user',
    example: '08a82592-714e-4da0-ace5-45ed3b4eb795',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  roleId!: string;
}

/** Build the admin user-role controller and apply consumer decorators. */
export function buildAdminUserRolesController(
  extras: AdminUserRolesControllerExtras = {},
): Type<unknown> {
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin')
  @Controller('admin/users/:userId/roles')
  class AdminUserRolesController {
    private readonly logger = new Logger(AdminUserRolesController.name);

    constructor(
      private readonly commandBus: CommandBus,
      private readonly queryBus: QueryBus,
    ) {}

    @ApiOperation({ summary: 'List roles assigned to a user' })
    @ApiParam({ name: 'userId', required: true })
    @ApiOkResponse({ description: 'Roles for the user' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @Get()
    async list(@Param('userId') userId: string) {
      return this.queryBus.execute(
        new GetAssignedRolesQuery({}, USER_ROLE_ENTITY_KEY, userId),
      );
    }

    @ApiOperation({ summary: 'Assign a role to a user' })
    @ApiParam({ name: 'userId', required: true })
    @ApiCreatedResponse({ description: 'Role assigned' })
    @ApiBadRequestResponse({ description: 'Invalid payload' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @Post()
    async assign(
      @Param('userId') userId: string,
      @Body() dto: AdminAssignUserRoleDto,
    ) {
      await this.commandBus.execute(
        new AssignRoleCommand({}, USER_ROLE_ENTITY_KEY, dto.roleId, userId),
      );
      this.logger.log(`Role ${dto.roleId} assigned to user ${userId}`);
    }
  }

  applyControllerExtras(AdminUserRolesController, extras, {
    list: 'list',
    assign: 'assign',
  });
  return AdminUserRolesController;
}
