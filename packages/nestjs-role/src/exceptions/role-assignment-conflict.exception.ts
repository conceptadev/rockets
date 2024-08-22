import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class RoleAssignmentConflictException extends RuntimeException {
  context: RuntimeException['context'] & {
    assignmentName: string;
    roleId: string;
    assigneeId: string;
  };

  constructor(assignmentName: string, roleId: string, assigneeId: string) {
    super({
      message: 'Role %s is already assigned to assignee %s for assignment %s.',
      messageParams: [roleId, assigneeId, assignmentName],
      httpStatus: HttpStatus.CONFLICT,
    });

    this.errorCode = 'ROLE_ASSIGNMENT_CONFLICT_ERROR';

    this.context = {
      assignmentName,
      roleId,
      assigneeId,
    };
  }
}
