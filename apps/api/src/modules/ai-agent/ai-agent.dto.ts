import {
  IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, IsArray,
  IsObject, IsBoolean, IsEnum, Min, Max,
} from 'class-validator';

export enum DocumentType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  TXT = 'TXT',
  CSV = 'CSV',
  URL = 'URL',
  MANUAL = 'MANUAL',
  FAQ = 'FAQ',
}

export class CreateAgentDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  personality?: string;

  @IsOptional() @IsString()
  systemPrompt?: string;

  @IsOptional() @IsString()
  model?: string;

  @IsOptional() @IsNumber() @Min(0) @Max(2)
  temperature?: number;

  @IsOptional() @IsInt() @Min(1)
  maxResponseLength?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  knowledgeBaseIds?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  allowedTools?: string[];

  @IsOptional() @IsObject()
  businessHours?: Record<string, any>;

  @IsOptional() @IsString()
  fallbackMessage?: string;

  @IsOptional() @IsBoolean()
  humanHandoffEnabled?: boolean;
}

export class UpdateAgentDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  personality?: string;

  @IsOptional() @IsString()
  systemPrompt?: string;

  @IsOptional() @IsString()
  model?: string;

  @IsOptional() @IsNumber() @Min(0) @Max(2)
  temperature?: number;

  @IsOptional() @IsInt() @Min(1)
  maxResponseLength?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  knowledgeBaseIds?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  allowedTools?: string[];

  @IsOptional() @IsObject()
  businessHours?: Record<string, any>;

  @IsOptional() @IsString()
  fallbackMessage?: string;

  @IsOptional() @IsBoolean()
  humanHandoffEnabled?: boolean;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class CreateKnowledgeBaseDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsOptional() @IsString()
  description?: string;
}

export class AddDocumentDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString()
  sourceUrl?: string;
}
