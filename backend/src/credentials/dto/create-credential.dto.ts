import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCredentialDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: 'Certificate of Completion' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Complete course', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ipfsHash?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileHash?: string;
}
