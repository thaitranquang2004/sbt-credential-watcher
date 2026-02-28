import { Injectable } from '@nestjs/common';
import { Student } from './entities/student.entity';
import { MockDatabaseService } from '../common/services/mock-database.service';

@Injectable()
export class StudentsService {
  constructor(private mockDb: MockDatabaseService) {}

  async findAll(): Promise<Student[]> {
    return this.mockDb.findAllStudents();
  }

  async findOne(id: string): Promise<Student | undefined> {
    return this.mockDb.findStudentById(id);
  }

  async create(data: Partial<Student>): Promise<Student> {
    return this.mockDb.createStudent(data);
  }

  async update(id: string, data: Partial<Student>): Promise<Student | undefined> {
    return this.mockDb.updateStudent(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.mockDb.deleteStudent(id);
  }
}
