import { Injectable } from '@nestjs/common';
import { Student } from '../../students/entities/student.entity';
import { Credential } from '../../credentials/entities/credential.entity';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class MockDatabaseService {
  private users: User[] = [];
  private students: Student[] = [];
  private credentials: Credential[] = [];
  private idCounter = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    this.users = [
      {
        id: 'user-admin-001',
        username: 'admin',
        passwordHash: '$2b$10$xVqYLGQKkL8ZqJ3Q5kHzKOqY3Q5kHzKOqY3Q5kHzKOqY3Q5kHzKOq',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-student-001',
        username: 'student1',
        passwordHash: '$2b$10$dummy',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.students = [
      {
        id: 'student-001',
        userId: 'user-student-001',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1',
        studentCode: 'SV001',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'student-002',
        userId: null,
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        walletAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA7',
        studentCode: 'SV002',
        status: 'active',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        id: 'student-003',
        userId: null,
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4d',
        studentCode: 'SV003',
        status: 'active',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
      },
      {
        id: 'student-004',
        userId: null,
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        walletAddress: '0x976EA74026E726554dB657fA54763abd0C3a0aa',
        studentCode: 'SV004',
        status: 'inactive',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
      },
    ];

    this.credentials = [
      {
        id: 'cred-001',
        studentId: 'student-001',
        student: null as any,
        name: 'Certificate of Completion - Blockchain Basics',
        description: 'Hoàn thành khóa học Blockchain Basics với điểm trung bình 9.0',
        ipfsHash: 'QmXyZ1234567890abcdef',
        fileHash: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef12345678',
        status: 'confirmed',
        txHash: '0xabc123def456789',
        tokenId: '1',
        verifyCode: 'CRED-20240115-ABC123',
        issuedAt: new Date('2024-01-20'),
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
      },
      {
        id: 'cred-002',
        studentId: 'student-001',
        student: null as any,
        name: 'Certificate of Completion - Smart Contract Development',
        description: 'Hoàn thành khóa học Smart Contract Development với điểm trung bình 8.5',
        ipfsHash: 'QmXyZ0987654321fedcba',
        fileHash: 'b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890',
        status: 'confirmed',
        txHash: '0xdef456789abc123',
        tokenId: '2',
        verifyCode: 'CRED-20240125-DEF456',
        issuedAt: new Date('2024-01-25'),
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-27'),
      },
      {
        id: 'cred-003',
        studentId: 'student-002',
        student: null as any,
        name: 'Certificate of Completion - Blockchain Basics',
        description: 'Hoàn thành khóa học Blockchain Basics với điểm trung bình 8.0',
        ipfsHash: 'QmXyZ1111222233334444',
        fileHash: 'c3d4e5f678901234567890abcdef01234567890abcdef0123456789',
        status: 'issued',
        txHash: '0x789abc123def456',
        tokenId: '3',
        verifyCode: 'CRED-20240201-GHI789',
        issuedAt: new Date('2024-02-01'),
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: 'cred-004',
        studentId: 'student-003',
        student: null as any,
        name: 'Certificate of Completion - DeFi Fundamentals',
        description: 'Hoàn thành khóa học DeFi Fundamentals',
        ipfsHash: null,
        fileHash: null,
        status: 'pending',
        txHash: null,
        tokenId: null,
        verifyCode: 'CRED-20240210-JKL012',
        issuedAt: null,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
      },
      {
        id: 'cred-005',
        studentId: 'student-003',
        student: null as any,
        name: 'Certificate of Completion - NFT Development',
        description: 'Hoàn thành khóa học NFT Development',
        ipfsHash: null,
        fileHash: null,
        status: 'pending',
        txHash: null,
        tokenId: null,
        verifyCode: 'CRED-20240212-MNO345',
        issuedAt: null,
        createdAt: new Date('2024-02-12'),
        updatedAt: new Date('2024-02-12'),
      },
    ];

    this.credentials.forEach(cred => {
      cred.student = this.students.find(s => s.id === cred.studentId)!;
    });
  }

  findAllUsers(): User[] {
    return this.users;
  }

  findUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  findUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  findAllStudents(): Student[] {
    return this.students;
  }

  findStudentById(id: string): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  findStudentByEmail(email: string): Student | undefined {
    return this.students.find(s => s.email === email);
  }

  createStudent(data: Partial<Student>): Student {
    const student: Student = {
      id: `student-${String(this.idCounter++).padStart(3, '0')}`,
      userId: data.userId || null,
      name: data.name,
      email: data.email,
      walletAddress: data.walletAddress || null,
      studentCode: data.studentCode || `SV${String(this.idCounter).padStart(3, '0')}`,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.students.push(student);
    return student;
  }

  updateStudent(id: string, data: Partial<Student>): Student | undefined {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.students[index] = { ...this.students[index], ...data, updatedAt: new Date() };
    return this.students[index];
  }

  deleteStudent(id: string): boolean {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.students.splice(index, 1);
    return true;
  }

  findAllCredentials(): Credential[] {
    return this.credentials.map(cred => ({
      ...cred,
      student: this.students.find(s => s.id === cred.studentId)!,
    }));
  }

  findCredentialById(id: string): Credential | undefined {
    const cred = this.credentials.find(c => c.id === id);
    if (!cred) return undefined;
    return {
      ...cred,
      student: this.students.find(s => s.id === cred.studentId)!,
    };
  }

  findCredentialByVerifyCode(code: string): Credential | undefined {
    const cred = this.credentials.find(c => c.verifyCode === code);
    if (!cred) return undefined;
    return {
      ...cred,
      student: this.students.find(s => s.id === cred.studentId)!,
    };
  }

  findCredentialsByStudentId(studentId: string): Credential[] {
    return this.credentials
      .filter(c => c.studentId === studentId)
      .map(cred => ({
        ...cred,
        student: this.students.find(s => s.id === cred.studentId)!,
      }));
  }

  createCredential(data: Partial<Credential>): Credential {
    const verifyCode = `CRED-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const credential: Credential = {
      id: `cred-${String(this.idCounter++).padStart(3, '0')}`,
      studentId: data.studentId,
      student: this.students.find(s => s.id === data.studentId)!,
      name: data.name,
      description: data.description || null,
      ipfsHash: data.ipfsHash || null,
      fileHash: data.fileHash || null,
      status: 'pending',
      txHash: null,
      tokenId: null,
      verifyCode,
      issuedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.credentials.push(credential);
    return credential;
  }

  updateCredential(id: string, data: Partial<Credential>): Credential | undefined {
    const index = this.credentials.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.credentials[index] = { 
      ...this.credentials[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return this.findCredentialById(id);
  }
}
