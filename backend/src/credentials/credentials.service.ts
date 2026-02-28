import { Injectable } from '@nestjs/common';
import { Credential } from './entities/credential.entity';
import { MockDatabaseService } from '../common/services/mock-database.service';

@Injectable()
export class CredentialsService {
  constructor(private mockDb: MockDatabaseService) {}

  async findAll(): Promise<Credential[]> {
    return this.mockDb.findAllCredentials();
  }

  async findOne(id: string): Promise<Credential | undefined> {
    return this.mockDb.findCredentialById(id);
  }

  async findByVerifyCode(code: string): Promise<Credential | undefined> {
    return this.mockDb.findCredentialByVerifyCode(code);
  }

  async findByStudentId(studentId: string): Promise<Credential[]> {
    return this.mockDb.findCredentialsByStudentId(studentId);
  }

  async create(data: Partial<Credential>): Promise<Credential> {
    return this.mockDb.createCredential(data);
  }

  async update(id: string, data: Partial<Credential>): Promise<Credential | undefined> {
    return this.mockDb.updateCredential(id, data);
  }
}
