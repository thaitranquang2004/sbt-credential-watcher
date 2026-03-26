import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { CredentialsModule } from './credentials/credentials.module';
import { EventsModule } from './events/events.module';
import { WatcherModule } from './watcher/watcher.module';
import { BroadcastModule } from './broadcast/broadcast.module';
import { AppController } from './app.controller';
import { MockDatabaseService } from './common/services/mock-database.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    StudentsModule,
    CredentialsModule,
    EventsModule,
    WatcherModule,
    BroadcastModule,
  ],
  controllers: [AppController],
  providers: [MockDatabaseService],
})
export class AppModule {}
