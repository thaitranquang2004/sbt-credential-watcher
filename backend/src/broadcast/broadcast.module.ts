import { Module } from '@nestjs/common';
import { BroadcastController } from './broadcast.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [BroadcastController],
})
export class BroadcastModule {}
