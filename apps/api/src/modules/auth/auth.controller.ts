import {
  Controller, Post, Get, Body, UseGuards, Req,
  HttpCode, HttpStatus, Res, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  IsEmail, IsString, IsNotEmpty, IsOptional, IsBoolean,
  MinLength, Matches,
} from 'class-validator';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public, RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, CurrentUserId } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class LoginDto {
  @IsEmail({}, { message: 'Enter a valid email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

class RegisterDto {
  @IsEmail({}, { message: 'Enter a valid email' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, { message: 'Password must include an uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must include a number' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsBoolean()
  acceptTerms: boolean;
}

class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

class TwoFactorDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  tempToken: string;
}

class Enable2FADto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and business' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('login/2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete login with 2FA code' })
  async loginTwoFactor(@Body() dto: TwoFactorDto, @Req() req: Request) {
    return this.authService.verifyTwoFactor(dto.tempToken, dto.code, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@CurrentUserId() userId: string, @Body() dto: RefreshTokenDto) {
    await this.authService.logout(userId, dto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout/all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout all sessions' })
  async logoutAll(@CurrentUserId() userId: string) {
    await this.authService.logoutAll(userId);
    return { message: 'All sessions terminated' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const dev = await this.authService.forgotPassword(dto.email);
    return { message: 'If that email is registered, a reset link has been sent.', ...(dev || {}) };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Password reset successfully' };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with OTP code' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification code' })
  async resendVerification(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendVerification(dto.email);
  }

  // ---- OAuth: Google ----
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Start Google OAuth login' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.oauthRedirect(req, res);
  }

  // ---- OAuth: GitHub (used by the "Facebook"/social button in dev) ----
  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Start GitHub OAuth login' })
  async githubAuth() {
    // Guard redirects to GitHub
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    return this.oauthRedirect(req, res);
  }

  private async oauthRedirect(req: Request, res: Response) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    try {
      const tokens = await this.authService.handleOAuthLogin(req.user as any, req.ip, req.headers['user-agent']);
      const payload = encodeURIComponent(Buffer.from(JSON.stringify(tokens)).toString('base64'));
      return res.redirect(`${appUrl}/auth/callback?data=${payload}`);
    } catch (e: any) {
      return res.redirect(`${appUrl}/login?error=${encodeURIComponent(e?.message || 'oauth_failed')}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Setup 2FA - get QR code' })
  async setup2FA(@CurrentUserId() userId: string) {
    return this.authService.setupTwoFactor(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Enable 2FA with verification code' })
  async enable2FA(@CurrentUserId() userId: string, @Body() dto: Enable2FADto) {
    return this.authService.enableTwoFactor(userId, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: any) {
    return user;
  }
}
