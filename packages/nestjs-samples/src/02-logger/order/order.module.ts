import { Module } from '@nestjs/common';
import { LoggerModule } from '@rockts-org/nestjs-logger';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  // TODO: LoggerModule is working as a for feature, need to change to work global
  imports: [LoggerModule.forRoot()],

  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
