import { BadRequestException } from '@nestjs/common';
import type { StandardSchemaV1 } from '@standard-schema/spec';

export { getCarriedStandardSchema } from '../../standard-schema/schema';

export function standardSchemaIssuesToMessages(
  issues: ReadonlyArray<StandardSchemaV1.Issue>,
): string[] {
  return issues.map((issue) => {
    const field = Array.isArray(issue.path)
      ? issue.path.map(pathSegmentToString).join('.')
      : '';
    return field ? `${field}: ${issue.message}` : issue.message;
  });
}

export function standardSchemaBadRequest(
  issues: ReadonlyArray<StandardSchemaV1.Issue>,
): BadRequestException {
  const messages = standardSchemaIssuesToMessages(issues);
  return new BadRequestException({
    statusCode: 400,
    message: messages.length === 1 ? messages[0] : messages,
    error: 'Bad Request',
  });
}

function pathSegmentToString(
  segment: PropertyKey | StandardSchemaV1.PathSegment,
): string {
  if (typeof segment === 'object' && segment !== null) {
    return String(segment.key);
  }
  return String(segment);
}
