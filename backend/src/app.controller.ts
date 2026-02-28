import { Controller, Get } from '@nestjs/common';
import { MockDatabaseService } from './common/services/mock-database.service';

@Controller()
export class AppController {
  constructor(private readonly mockDb: MockDatabaseService) {}

  @Get()
  getAllData() {
    return {
      users: this.mockDb.findAllUsers(),
      students: this.mockDb.findAllStudents(),
      credentials: this.mockDb.findAllCredentials(),
    };
  }
}
