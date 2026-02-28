import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0x1234...', required: false })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiProperty({ example: 'ST001', required: false })
  @IsOptional()
  @IsString()
  studentCode?: string;
}
