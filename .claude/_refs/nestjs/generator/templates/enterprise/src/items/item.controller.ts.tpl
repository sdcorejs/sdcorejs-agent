import { Body, Controller, Get, Param, Post, Put, Req, StreamableFile } from '@nestjs/common';
import { z } from 'zod';
import { Protected } from '../auth/policy';
import { RequestActor, requireActor } from '../auth/request-actor';
import { ZodPipe } from '../validation/zod.pipe';
import { ItemApproveRequest, ItemApproveSchema, ItemImportRequest, ItemImportSchema } from './item-action.schema';
import { ItemCreateRequest, ItemCreateSchema } from './item-create.schema';
import { ItemService } from './item.service';
import { ItemUpdateRequest, ItemUpdateSchema } from './item-update.schema';

interface ActorRequest { user?: unknown }

@Controller('items')
export class ItemController {
  constructor(private readonly service: ItemService) {}

  @Get()
  @Protected('items:read')
  search(@Req() request: ActorRequest) {
    return this.service.search(this.actor(request));
  }

  @Get('export')
  @Protected('items:export')
  export(@Req() request: ActorRequest) {
    return new StreamableFile(this.service.exportStream(this.actor(request)), {
      type: 'text/csv',
      disposition: 'attachment; filename="items.csv"',
    });
  }

  @Get(':id')
  @Protected('items:read')
  detail(
    @Param('id', new ZodPipe(z.string().uuid())) id: string,
    @Req() request: ActorRequest,
  ) {
    return this.service.detail(id, this.actor(request));
  }

{{#MUTATIONS}}
  @Post()
  @Protected('items:write')
  create(
    @Body(new ZodPipe(ItemCreateSchema)) body: ItemCreateRequest,
    @Req() request: ActorRequest,
  ) {
    return this.service.create(body, this.actor(request));
  }

  @Put(':id')
  @Protected('items:write')
  update(
    @Param('id', new ZodPipe(z.string().uuid())) id: string,
    @Body(new ZodPipe(ItemUpdateSchema)) body: ItemUpdateRequest,
    @Req() request: ActorRequest,
  ) {
    return this.service.update(id, body, this.actor(request));
  }

  @Put(':id/approve')
  @Protected('items:approve')
  approve(
    @Param('id', new ZodPipe(z.string().uuid())) id: string,
    @Body(new ZodPipe(ItemApproveSchema)) body: ItemApproveRequest,
    @Req() request: ActorRequest,
  ) {
    return this.service.approve(id, body, this.actor(request));
  }

  @Post('import')
  @Protected('items:import')
  importRows(
    @Body(new ZodPipe(ItemImportSchema)) body: ItemImportRequest,
    @Req() request: ActorRequest,
  ) {
    return this.service.importRows(body, this.actor(request));
  }
{{/MUTATIONS}}

  private actor(request: ActorRequest): RequestActor {
    return requireActor(request.user);
  }
}
