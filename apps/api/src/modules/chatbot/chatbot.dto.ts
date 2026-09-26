import {
  IsString, IsNotEmpty, IsOptional, IsObject, IsBoolean, IsArray,
} from 'class-validator';

export class CreateChatbotDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsObject()
  trigger?: Record<string, any>;

  @IsOptional() @IsObject()
  flow?: Record<string, any>;
}

export class UpdateChatbotDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsObject()
  trigger?: Record<string, any>;

  @IsOptional() @IsObject()
  flow?: Record<string, any>;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class SaveFlowDto {
  @IsArray()
  nodes: any[];

  @IsArray()
  edges: any[];

  @IsOptional() @IsString()
  name?: string;
}
