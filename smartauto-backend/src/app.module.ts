import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { PartsModule } from './parts/parts.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    PrismaModule,
    OrdersModule,
    UsersModule,
    CarsModule,
    PartsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
