import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsArray,
} from 'class-validator';

export enum TemplateCategory {
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
  AUTHENTICATION = 'AUTHENTICATION',
}

export class CreateTemplateDto {
  @IsOptional() @IsString()
  phoneNumberId?: string;

  @IsString() @IsNotEmpty()
  name: string;

  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @IsOptional() @IsString()
  language?: string;

  @IsOptional() @IsString()
  headerType?: string;

  @IsOptional() @IsString()
  headerContent?: string;

  @IsString() @IsNotEmpty()
  body: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  bodyVariables?: string[];

  @IsOptional() @IsString()
  footer?: string;

  @IsOptional() @IsArray()
  buttons?: any[];
}
