export class User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'student' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}
