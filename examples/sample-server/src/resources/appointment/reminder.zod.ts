import { zodResource } from '../../zod-bindings';
import { Reminder, reminderSchema } from './reminder.schema';
import { ReminderOwnerScopeHook } from './reminder-owner-scope.hook';

/** Reminder rows are created by `AppointmentCreateHandler`; these routes are list/read only. */
export const reminderZodResource = zodResource({
  name: 'Reminder',
  schema: reminderSchema,
  hooks: [ReminderOwnerScopeHook],
  operations: { list: true, read: true },
});

/**
 * Generated response DTO (component name `ReminderResponseDto`).
 * `AppointmentResponseDto` nests it for the eager `reminders` array —
 * one class serves both the `/reminders` routes and the nested
 * projection, exactly like the old handwritten DTO did.
 */
export const ReminderResponseDto = reminderZodResource.zod.dtos.response;
export type ReminderResponseDto = Reminder;
