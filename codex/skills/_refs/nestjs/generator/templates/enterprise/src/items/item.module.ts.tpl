import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ItemController } from './item.controller';
import { FileImportOperationStore, ImportOperationStore } from './item-import-store';
import { ItemRepository } from './item.repository';
import { ItemService } from './item.service';

@Module({
  imports: [AuthModule],
  controllers: [ItemController],
  providers: [
    ItemRepository,
    ItemService,
    { provide: ImportOperationStore, useClass: FileImportOperationStore },
  ],
  exports: [ItemService],
})
export class ItemsModule {}
