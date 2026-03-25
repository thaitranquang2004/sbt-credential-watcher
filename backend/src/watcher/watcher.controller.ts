import { Controller, Get } from '@nestjs/common';
import { WatcherService } from './watcher.service';

@Controller('watcher')
export class WatcherController {
  constructor(private readonly watcherService: WatcherService) {}

  @Get('status')
  getStatus() {
    return this.watcherService.getStatus();
  }
}
