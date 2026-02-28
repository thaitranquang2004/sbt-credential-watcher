import { Student } from '../../students/entities/student.entity';

export class Credential {
  id: string;
  studentId: string;
  student: Student;
  name: string;
  description: string | null;
  ipfsHash: string | null;
  fileHash: string | null;
  status: 'pending' | 'issued' | 'confirmed' | 'revoked';
  txHash: string | null;
  tokenId: string | null;
  verifyCode: string | null;
  issuedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
