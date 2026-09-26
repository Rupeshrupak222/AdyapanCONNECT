import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject, IsDateString,
} from 'class-validator';

export enum CampaignType {
  IMMEDIATE = 'IMMEDIATE',
  SCHEDULED = 'SCHEDULED',
  RECURRING = 'RECURRING',
  CSV = 'CSV',
}

export class CreateCampaignDto {
  @IsString() @IsNotEmpty()
  templateId: string;

  @IsString() @IsNotEmpty()
  phoneNumberId: string;

  @IsString() @IsNotEmpty()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(CampaignType)
  type?: CampaignType;

  @IsOptional() @IsArray() @IsString({ each: true })
  segmentIds?: string[];

  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @IsOptional() @IsObject()
  variables?: Record<string, any>;

  @IsOptional() @IsString()
  utmSource?: string;

  @IsOptional() @IsString()
  utmMedium?: string;

  @IsOptional() @IsString()
  utmCampaign?: string;
}

export class UpdateCampaignDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(CampaignType)
  type?: CampaignType;

  @IsOptional() @IsString()
  phoneNumberId?: string;

  @IsOptional() @IsString()
  templateId?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  segmentIds?: string[];

  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @IsOptional() @IsObject()
  variables?: Record<string, any>;

  @IsOptional() @IsString()
  utmSource?: string;

  @IsOptional() @IsString()
  utmMedium?: string;

  @IsOptional() @IsString()
  utmCampaign?: string;
}
