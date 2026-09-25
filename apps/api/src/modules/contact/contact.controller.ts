import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Public, SuperAdminOnly } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ContactService } from './contact.service';

class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsEmail({}, { message: 'Enter a valid email' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(4000)
  message: string;

  @IsOptional()
  @IsString()
  source?: string;
}

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Public — website contact form posts here.
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a contact / enquiry message' })
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  // Admin-only — view + manage enquiries.
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @SuperAdminOnly()
  @ApiBearerAuth('JWT')
  @Get()
  list(@Query() q: any) {
    return this.contactService.list(q);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @SuperAdminOnly()
  @ApiBearerAuth('JWT')
  @Get('unread-count')
  unread() {
    return this.contactService.unreadCount();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @SuperAdminOnly()
  @ApiBearerAuth('JWT')
  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  setStatus(@Param('id') id: string, @Body('status') status: 'NEW' | 'READ' | 'RESPONDED' | 'ARCHIVED') {
    return this.contactService.setStatus(id, status);
  }
}
