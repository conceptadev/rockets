import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from '@concepta/nestjs-email';
import { ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notification')
@ApiTags('notification')
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
