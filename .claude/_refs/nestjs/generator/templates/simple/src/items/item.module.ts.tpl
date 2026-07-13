import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ItemController } from './item.controller';
import { ItemRepository } from './item.repository';
import { ItemService } from './item.service';

@Module({
  imports: [AuthModule],
  controllers: [ItemController],
  providers: [ItemRepository, ItemService],
  exports: [ItemService],
})
export class ItemsModule {}
