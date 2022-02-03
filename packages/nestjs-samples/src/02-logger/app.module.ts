import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { LoggerModule } from '@rockts-org/nestjs-logger';
@Module({
  imports: [LoggerModule.register(), OrderModule],
  // TODO: transform loggerModule to work as a forRoot today is only working as forFeature
  //imports:[LoggerModule.forRoot(), OrderModule],
})
export class AppModule {}
