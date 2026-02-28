export class Student {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  walletAddress: string | null;
  studentCode: string | null;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: Date;
  updatedAt: Date;
}
