import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SentEmail {
  to: string;
  subject: string;
  body: string;
  link?: string;
  sentAt: Date;
}

/**
 * Dev-friendly mail service.
 *
 * If SMTP env vars are configured, this is where a real transport (nodemailer, SES,
 * Resend, etc.) would be wired in. For local development without SMTP, emails are
 * logged to the API console and kept in-memory so the verification / reset flow is
 * fully usable end-to-end.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly appUrl: string;
  private readonly devMode: boolean;

  // keep the last few emails in memory for local inspection / dev endpoints
  private readonly outbox: SentEmail[] = [];

  constructor(private readonly config: ConfigService) {
    this.appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    // dev mode when no SMTP host is configured
    this.devMode = !this.config.get('SMTP_HOST');
  }

  private async deliver(email: SentEmail) {
    this.outbox.unshift(email);
    if (this.outbox.length > 50) this.outbox.pop();

    if (this.devMode) {
      this.logger.log(
        `\n${'='.repeat(60)}\n[DEV EMAIL] To: ${email.to}\nSubject: ${email.subject}\n${email.link ? `Link: ${email.link}\n` : ''}${email.body}\n${'='.repeat(60)}`,
      );
      return;
    }

    // TODO: plug real transport here using SMTP_* env vars.
    this.logger.warn('SMTP configured but no transport wired yet; email not sent.');
  }

  getOutbox(): SentEmail[] {
    return this.outbox;
  }

  async sendVerificationEmail(to: string, otp: string, userId?: string) {
    const link = `${this.appUrl}/verify-email?email=${encodeURIComponent(to)}${userId ? `&uid=${userId}` : ''}`;
    await this.deliver({
      to,
      subject: 'Verify your Adyapan Connect email',
      link,
      body: `Welcome to Adyapan Connect!\n\nYour verification code is: ${otp}\n\nOr open this link and enter the code: ${link}\n\nThis code expires in 24 hours.`,
      sentAt: new Date(),
    });
    return { link, devMode: this.devMode };
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const link = `${this.appUrl}/reset-password?token=${token}`;
    await this.deliver({
      to,
      subject: 'Reset your Adyapan Connect password',
      link,
      body: `We received a request to reset your password.\n\nReset it here: ${link}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
      sentAt: new Date(),
    });
    return { link, devMode: this.devMode };
  }
}
