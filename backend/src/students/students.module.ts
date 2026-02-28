import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { MockDatabaseService } from '../common/services/mock-database.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, MockDatabaseService],
  exports: [StudentsService],
})
export class StudentsModule {}
