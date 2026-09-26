import {
  IsString, IsNotEmpty, IsOptional, IsObject, IsArray, IsEnum,
} from 'class-validator';

export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

export class CreateWorkflowDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsObject()
  trigger: Record<string, any>;

  @IsOptional() @IsArray()
  nodes?: any[];

  @IsOptional() @IsArray()
  edges?: any[];
}

export class UpdateWorkflowDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsObject()
  trigger?: Record<string, any>;

  @IsOptional() @IsArray()
  nodes?: any[];

  @IsOptional() @IsArray()
  edges?: any[];

  @IsOptional() @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;
}
