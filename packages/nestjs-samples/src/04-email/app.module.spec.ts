import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { EmailService } from '@rockts-org/nestjs-email';
import { NotificationController } from './notification/notification.controller';

describe('AppModule', () => {
  let notificationController: NotificationController;
  let logService: jest.SpyInstance;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    notificationController = app.get<NotificationController>(
      NotificationController,
    );

    const emailService: EmailService = app.get(EmailService);

    logService = jest
      .spyOn(emailService, 'sendEmail')
      .mockImplementation(() => null);
  });

  describe('Notification Controller', () => {
    it('Create notification', () => {
      notificationController.create({ emailAddress: 'email@email.com' });
      expect(logService).toBeCalledTimes(1);
    });
  });
});
