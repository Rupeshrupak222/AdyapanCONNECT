import {
  IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsArray,
  IsObject, ValidateNested, ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OptStatus {
  OPTED_IN = 'OPTED_IN',
  OPTED_OUT = 'OPTED_OUT',
  PENDING = 'PENDING',
  UNKNOWN = 'UNKNOWN',
}

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional() @IsString()
  countryCode?: string;

  @IsOptional() @IsString()
  firstName?: string;

  @IsOptional() @IsString()
  lastName?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  company?: string;

  @IsOptional() @IsString()
  jobTitle?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsObject()
  customAttributes?: Record<string, any>;

  @IsOptional() @IsEnum(OptStatus)
  optStatus?: OptStatus;
}

export class UpdateContactDto {
  @IsOptional() @IsString() @IsNotEmpty()
  phoneNumber?: string;

  @IsOptional() @IsString()
  countryCode?: string;

  @IsOptional() @IsString()
  firstName?: string;

  @IsOptional() @IsString()
  lastName?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  company?: string;

  @IsOptional() @IsString()
  jobTitle?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsObject()
  customAttributes?: Record<string, any>;

  @IsOptional() @IsEnum(OptStatus)
  optStatus?: OptStatus;
}

export class BulkImportItemDto {
  @IsString() @IsNotEmpty()
  phoneNumber: string;

  @IsOptional() @IsString()
  firstName?: string;

  @IsOptional() @IsString()
  lastName?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  company?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsObject()
  customAttributes?: Record<string, any>;
}

export class BulkImportDto {
  @IsArray()
  @ArrayMaxSize(10000)
  @ValidateNested({ each: true })
  @Type(() => BulkImportItemDto)
  contacts: BulkImportItemDto[];
}
