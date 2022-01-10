import { Controller, Post, Body } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EmailService } from '@rockts-org/nestjs-email';

@Controller('notification')
export class NotificationController {
  constructor(private readonly emailService: EmailService) {}

  @Post('/')
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    await this.emailService.sendEmail({
      to: createNotificationDto.emailAddress,
      from: 'Rockets Email <rockets@email.com>',
      subject: 'Sample Email',
    });
  }
}
