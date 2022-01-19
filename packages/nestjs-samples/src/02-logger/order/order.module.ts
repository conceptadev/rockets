import { Module } from '@nestjs/common';
import { LoggerModule } from '@rockts-org/nestjs-logger';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [LoggerModule.deferred()],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
