import { Controller, Get, Put, Post, Body, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { UsersService } from './users.service';

class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  newPassword: string;
}

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUserId() userId: string) { return this.usersService.findById(userId); }

  @Put('me')
  updateProfile(@CurrentUserId() userId: string, @Body() dto: any) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(@CurrentUserId() userId: string, @Body() dto: ChangePasswordDto) {
    try {
      await this.usersService.changePassword(userId, dto.currentPassword, dto.newPassword);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Could not change password');
    }
    return { message: 'Password changed successfully' };
  }

  @Get('me/sessions')
  getSessions(@CurrentUserId() userId: string) { return this.usersService.getSessions(userId); }
}
