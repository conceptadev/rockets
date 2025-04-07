import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';
import { RoleException } from './role.exception';

export class RoleAssignmentConflictException extends RoleException {
  context: RuntimeException['context'] & {
    assignmentName: string;
    roleId: string;
    assigneeId: string;
  };

  constructor(
    assignmentName: string,
    roleId: string,
    assigneeId: string,
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message: 'Role %s is already assigned to assignee %s for assignment %s.',
      messageParams: [roleId, assigneeId, assignmentName],
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'ROLE_ASSIGNMENT_CONFLICT_ERROR';

    this.context = {
      ...super.context,
      assignmentName,
      roleId,
      assigneeId,
    };
  }
}
