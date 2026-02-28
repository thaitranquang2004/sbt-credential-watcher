import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MockDatabaseService } from '../common/services/mock-database.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mockDb: MockDatabaseService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.mockDb.findUserByUsername(username);
    if (user && user.username === 'admin') {
      return { id: user.id, username: user.username, role: user.role };
    }
    return null;
  }

  async login(loginData: { username: string; password: string }) {
    const user = await this.validateUser(loginData.username, loginData.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
