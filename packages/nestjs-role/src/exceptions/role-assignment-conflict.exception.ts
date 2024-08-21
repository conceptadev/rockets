import { format } from 'util';
import { ExceptionInterface } from '@concepta/ts-core';

export class RoleAssignmentConflictException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'ROLE_ASSIGNMENT_CONFLICT_ERROR';

  context: {
    assignmentName: string;
    roleId: string;
    assigneeId: string;
  };

  constructor(
    assignmentName: string,
    roleId: string,
    assigneeId: string,
    message = 'Role %s is already assigned to assignee %s for assignment %s.',
  ) {
    super(format(message, roleId, assigneeId, assignmentName));
    this.context = {
      assignmentName,
      roleId,
      assigneeId,
    };
  }
}
