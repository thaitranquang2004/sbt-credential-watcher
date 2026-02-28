import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

@ApiTags('credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private credentialsService: CredentialsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all credentials' })
  findAll() {
    return this.credentialsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credential by ID' })
  findOne(@Param('id') id: string) {
    return this.credentialsService.findOne(id);
  }

  @Get('verify/:code')
  @ApiOperation({ summary: 'Get credential by verify code (public)' })
  findByVerifyCode(@Param('code') code: string) {
    return this.credentialsService.findByVerifyCode(code);
  }

  @Post()
  @ApiOperation({ summary: 'Issue new credential' })
  create(@Body() createCredentialDto: CreateCredentialDto) {
    return this.credentialsService.create(createCredentialDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update credential status' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.credentialsService.update(id, data);
  }
}
