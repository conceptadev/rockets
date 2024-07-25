import { CacheAssignmentNotFoundException } from './cache-assignment-not-found.exception';

describe('AssignmentNotFoundException', () => {
  it('should create an instance with default message', () => {
    const assignmentName = 'testAssignment';
    const exception = new CacheAssignmentNotFoundException(assignmentName);

    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(
      'Assignment testAssignment was not registered to be used.',
    );
    expect(exception.context).toEqual({ assignmentName: 'testAssignment' });
    expect(exception.errorCode).toBe('CACHE_ASSIGNMENT_NOT_FOUND_ERROR');
  });

  it('should create an instance with custom message', () => {
    const assignmentName = 'testAssignment';
    const customMessage = 'Custom message for %s';
    const exception = new CacheAssignmentNotFoundException(
      assignmentName,
      customMessage,
    );

    expect(exception.message).toBe('Custom message for testAssignment');
  });
});
