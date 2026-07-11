import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AppExceptionFilter } from './errors/app-error';
import { ItemsModule } from './items/item.module';

@Module({
  imports: [AuthModule, ItemsModule],
  providers: [
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class AppModule {}
