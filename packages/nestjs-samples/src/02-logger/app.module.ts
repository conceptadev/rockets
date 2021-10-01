import { Module } from '@nestjs/common';
import { LoggerModule } from '../../../nestjs-logger/dist';
import { OrderModule } from './order/order.module';

@Module({
  imports: [OrderModule]
  // TODO: transform loggerModule to work as a forRoot today is only working as forFeature
  //imports:[LoggerModule.forRoot(), OrderModule],
})
export class AppModule {}
