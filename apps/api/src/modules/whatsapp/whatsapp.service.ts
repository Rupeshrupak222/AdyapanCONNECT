import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';
import { decrypt, encrypt } from '../../common/utils/encryption';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly graphApiUrl: string;
  private readonly graphApiVersion: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.graphApiUrl = config.get('META_GRAPH_API_URL', 'https://graph.facebook.com');
    this.graphApiVersion = config.get('META_GRAPH_API_VERSION', 'v19.0');
  }

  // ─── Core API call ──────────────────────────────────────────────────────────

  async callGraphApi(method: 'get' | 'post' | 'delete', path: string, accessToken: string, data?: any) {
    const url = `${this.graphApiUrl}/${this.graphApiVersion}/${path}`;
    try {
      const response = await firstValueFrom(
        this.http.request({
          method,
          url,
          headers: { Authorization: `Bearer ${accessToken}` },
          data,
        }),
      );
      return response.data;
    } catch (error: any) {
      const errData = error.response?.data?.error;
      this.logger.error(`Graph API error: ${errData?.message || error.message}`, {
        code: errData?.code,
        type: errData?.type,
        path,
      });
      throw new BadRequestException(errData?.message || 'WhatsApp API call failed');
    }
  }

  // ─── Send message ───────────────────────────────────────────────────────────

  async sendMessage(phoneNumberId: string, accessToken: string, messagePayload: any): Promise<{ messageId: string }> {
    const result = await this.callGraphApi(
      'post',
      `${phoneNumberId}/messages`,
      accessToken,
      { messaging_product: 'whatsapp', ...messagePayload },
    );

    if (!result.messages?.[0]?.id) {
      throw new InternalServerErrorException('No message ID returned from WhatsApp API');
    }

    return { messageId: result.messages[0].id };
  }

  async sendTextMessage(phoneNumberId: string, accessToken: string, to: string, text: string) {
    return this.sendMessage(phoneNumberId, accessToken, {
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: text },
    });
  }

  async sendTemplateMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[],
  ) {
    return this.sendMessage(phoneNumberId, accessToken, {
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components && { components }),
      },
    });
  }

  async sendMediaMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    type: 'image' | 'video' | 'audio' | 'document',
    mediaUrl: string,
    caption?: string,
    filename?: string,
  ) {
    return this.sendMessage(phoneNumberId, accessToken, {
      recipient_type: 'individual',
      to,
      type,
      [type]: {
        link: mediaUrl,
        ...(caption && { caption }),
        ...(filename && { filename }),
      },
    });
  }

  async sendInteractiveMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    interactive: any,
  ) {
    return this.sendMessage(phoneNumberId, accessToken, {
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    });
  }

  async markAsRead(phoneNumberId: string, accessToken: string, messageId: string) {
    return this.callGraphApi('post', `${phoneNumberId}/messages`, accessToken, {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });
  }

  // ─── WABA management ────────────────────────────────────────────────────────

  async getWabaInfo(wabaId: string, accessToken: string) {
    return this.callGraphApi('get', `${wabaId}?fields=id,name,currency,timezone_id,business_type,verified_name`, accessToken);
  }

  async getPhoneNumbers(wabaId: string, accessToken: string) {
    return this.callGraphApi('get', `${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,platform_type,throughput,last_onboarded_time`, accessToken);
  }

  async getPhoneNumberInfo(phoneNumberId: string, accessToken: string) {
    return this.callGraphApi('get', `${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,platform_type,throughput,last_onboarded_time,name_status,status`, accessToken);
  }

  // ─── Template management ─────────────────────────────────────────────────────

  async submitTemplate(wabaId: string, accessToken: string, templateData: any) {
    return this.callGraphApi('post', `${wabaId}/message_templates`, accessToken, templateData);
  }

  async getTemplates(wabaId: string, accessToken: string) {
    return this.callGraphApi('get', `${wabaId}/message_templates?fields=id,name,status,category,language,components,quality_score,rejected_reason`, accessToken);
  }

  async deleteTemplate(wabaId: string, accessToken: string, templateName: string) {
    return this.callGraphApi('delete', `${wabaId}/message_templates?name=${templateName}`, accessToken);
  }

  // ─── Media ──────────────────────────────────────────────────────────────────

  async uploadMedia(phoneNumberId: string, accessToken: string, fileBuffer: Buffer, mimeType: string) {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('file', fileBuffer, { contentType: mimeType, filename: 'upload' });
    form.append('type', mimeType);
    return this.callGraphApi('post', `${phoneNumberId}/media`, accessToken, form);
  }

  async getMediaUrl(mediaId: string, accessToken: string) {
    const result = await this.callGraphApi('get', mediaId, accessToken);
    return result.url;
  }

  // ─── Token & stored phone number helpers ─────────────────────────────────────

  async getAccessTokenForPhoneNumber(phoneNumberId: string): Promise<string> {
    const phoneNumber = await this.prisma.whatsAppPhoneNumber.findUnique({
      where: { phoneNumberId },
      select: { accessTokenEncrypted: true },
    });

    if (!phoneNumber?.accessTokenEncrypted) {
      throw new BadRequestException(`No access token found for phone number ${phoneNumberId}`);
    }

    return decrypt(phoneNumber.accessTokenEncrypted);
  }

  async syncPhoneNumberStatus(phoneNumberId: string) {
    const token = await this.getAccessTokenForPhoneNumber(phoneNumberId);
    const info = await this.getPhoneNumberInfo(phoneNumberId, token);

    await this.prisma.whatsAppPhoneNumber.update({
      where: { phoneNumberId },
      data: {
        qualityRating: info.quality_rating || 'UNKNOWN',
        verifiedName: info.verified_name,
        nameStatus: info.name_status,
        lastSyncAt: new Date(),
      },
    });

    return info;
  }

  // ─── Embedded Signup (BSP onboarding) ────────────────────────────────────────

  /**
   * Exchange the short-lived `code` returned by Facebook Login (embedded signup)
   * for a business access token tied to the customer's WABA.
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    const appId = this.config.get('META_APP_ID');
    const appSecret = this.config.get('META_APP_SECRET');
    const result = await this.callGraphApiNoAuth('get',
      `oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${encodeURIComponent(code)}`,
    );
    if (!result.access_token) {
      throw new BadRequestException('Could not exchange code for an access token');
    }
    return result.access_token as string;
  }

  /** Graph API call without a bearer token (used for oauth token exchange). */
  async callGraphApiNoAuth(method: 'get' | 'post', path: string, data?: any) {
    const url = `${this.graphApiUrl}/${this.graphApiVersion}/${path}`;
    try {
      const response = await firstValueFrom(this.http.request({ method, url, data }));
      return response.data;
    } catch (error: any) {
      const errData = error.response?.data?.error;
      this.logger.error(`Graph API (noauth) error: ${errData?.message || error.message}`);
      throw new BadRequestException(errData?.message || 'WhatsApp API call failed');
    }
  }

  /** List the WABAs the given token has access to (shared via embedded signup). */
  async getSharedWabas(accessToken: string) {
    // debug_token reveals granular scopes incl. the WABA the user shared
    const appId = this.config.get('META_APP_ID');
    const appSecret = this.config.get('META_APP_SECRET');
    const debug = await this.callGraphApiNoAuth('get',
      `debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`,
    );
    const scopes = debug?.data?.granular_scopes || [];
    const waScope = scopes.find((s: any) => s.scope === 'whatsapp_business_management' || s.scope === 'whatsapp_business_messaging');
    return (waScope?.target_ids || []) as string[];
  }

  /** Subscribe our app to receive webhooks for a WABA. */
  async subscribeAppToWaba(wabaId: string, accessToken: string) {
    try {
      return await this.callGraphApi('post', `${wabaId}/subscribed_apps`, accessToken, {});
    } catch (e: any) {
      this.logger.warn(`Could not subscribe app to WABA ${wabaId}: ${e.message}`);
      return null;
    }
  }

  /** Register the phone number for Cloud API messaging (required once). */
  async registerPhoneNumber(phoneNumberId: string, accessToken: string, pin = '000000') {
    try {
      return await this.callGraphApi('post', `${phoneNumberId}/register`, accessToken, {
        messaging_product: 'whatsapp',
        pin,
      });
    } catch (e: any) {
      this.logger.warn(`Phone register skipped/failed for ${phoneNumberId}: ${e.message}`);
      return null;
    }
  }

  // ─── Webhook verification ────────────────────────────────────────────────────

  verifyWebhook(mode: string, token: string, challenge: string): string | false {
    const verifyToken = this.config.get('META_VERIFY_TOKEN') || this.config.get('WHATSAPP_VERIFY_TOKEN');
    if (mode === 'subscribe' && verifyToken && token === verifyToken) {
      return challenge;
    }
    return false;
  }
}
