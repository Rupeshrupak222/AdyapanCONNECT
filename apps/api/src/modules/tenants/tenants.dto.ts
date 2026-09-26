import { IsString, IsOptional, IsBoolean, IsObject, IsUrl } from 'class-validator';

/**
 * Whitelisted tenant settings a tenant admin may update.
 * Deliberately EXCLUDES status, slug, agencyId, trialEndsAt and other
 * platform-controlled columns to prevent privilege/state escalation.
 */
export class UpdateTenantDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  logoUrl?: string;

  @IsOptional() @IsString()
  faviconUrl?: string;

  @IsOptional() @IsString()
  websiteUrl?: string;

  @IsOptional() @IsString()
  industry?: string;

  @IsOptional() @IsString()
  country?: string;

  @IsOptional() @IsString()
  timezone?: string;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsObject()
  customColors?: Record<string, any>;

  @IsOptional() @IsBoolean()
  isWhiteLabel?: boolean;

  @IsOptional() @IsString()
  customDomain?: string;
}
