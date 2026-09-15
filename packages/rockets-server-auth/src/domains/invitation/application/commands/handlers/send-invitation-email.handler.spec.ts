/**
 * The failure-reporting branches of the invitation mail handler.
 *
 * A unit spec on purpose: the invitation e2e covers the send failure over
 * HTTP, but no route reaches the user-lookup failure or a misbehaving event
 * publisher, and those are the branches whose contract changed — an event
 * only when there is an address to report, and a publish guard that
 * contains a throwing or rejecting publisher.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '@nestjs/common';
import type { EventBus, QueryBus } from '@nestjs/cqrs';
import type { EmailService } from '@concepta/nestjs-email';
import type { InvitationEventPayloadInterface } from '@concepta/nestjs-invitation';
import { NotificationSendFailedEvent } from '@concepta/nestjs-authentication';

import { SendInvitationEmailCommand } from '../impl/send-invitation-email.command';
import { SendInvitationEmailHandler } from './send-invitation-email.handler';
import type { RocketsAuthSettingsInterface } from '../../../../../shared/interfaces/rockets-auth-settings.interface';

const settings = {
  email: {
    from: 'noreply@example.com',
    baseUrl: 'https://app.example.com',
    templates: {
      invitation: {
        logo: 'logo.png',
        fileName: 'invitation.hbs',
        subject: 'You are invited',
      },
    },
  },
} as RocketsAuthSettingsInterface;

const invitation = {
  id: 'inv-1',
  userId: 'user-1',
} as InvitationEventPayloadInterface;

function command(): SendInvitationEmailCommand {
  return new SendInvitationEmailCommand({
    ctx: {},
    invitation,
    passcode: 'passcode',
    tokenExp: new Date('2026-01-01T00:00:00Z'),
  });
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('SendInvitationEmailHandler failure reporting', () => {
  let logError: ReturnType<typeof vi.spyOn>;
  const sendMail = vi.fn();
  const execute = vi.fn();
  const publish = vi.fn();

  const handler = new SendInvitationEmailHandler(
    { sendMail } as unknown as EmailService,
    { execute } as unknown as QueryBus,
    settings,
    { publish } as unknown as EventBus,
  );

  beforeEach(() => {
    logError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    sendMail.mockReset();
    execute.mockReset();
    publish.mockReset();
  });

  afterEach(() => {
    logError.mockRestore();
  });

  it('publishes the failure event with the address when the send fails', async () => {
    execute.mockResolvedValue({ email: 'invitee@example.com' });
    sendMail.mockRejectedValue(new Error('smtp is down'));

    await handler.execute(command());

    expect(publish).toHaveBeenCalledTimes(1);
    const event = publish.mock.calls[0][0];
    expect(event).toBeInstanceOf(NotificationSendFailedEvent);
    expect(event.email).toBe('invitee@example.com');
    expect(event.command).toBe(SendInvitationEmailCommand);
    expect(event.error.errorCode).toBe('AUTHENTICATION_EMAIL_ERROR');
  });

  it('logs the ids but publishes nothing when the user lookup fails', async () => {
    execute.mockResolvedValue(null);

    await handler.execute(command());

    expect(sendMail).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(
      'Failed to send invitation email',
      expect.objectContaining({
        invitationId: 'inv-1',
        userId: 'user-1',
        stage: 'user-lookup',
      }),
    );
  });

  it('contains a publisher that rejects', async () => {
    execute.mockResolvedValue({ email: 'invitee@example.com' });
    sendMail.mockRejectedValue(new Error('smtp is down'));
    publish.mockReturnValue(Promise.reject(new Error('broker is down')));

    await expect(handler.execute(command())).resolves.toBeUndefined();
    await flushMicrotasks();

    expect(logError).toHaveBeenCalledWith(
      'Failed to publish the notification-failure event',
      expect.objectContaining({ error: 'broker is down' }),
    );
  });

  it('contains a publisher that throws synchronously', async () => {
    execute.mockResolvedValue({ email: 'invitee@example.com' });
    sendMail.mockRejectedValue(new Error('smtp is down'));
    publish.mockImplementation(() => {
      throw new Error('publisher exploded');
    });

    await expect(handler.execute(command())).resolves.toBeUndefined();

    expect(logError).toHaveBeenCalledWith(
      'Failed to publish the notification-failure event',
      expect.objectContaining({ error: 'publisher exploded' }),
    );
  });
});
