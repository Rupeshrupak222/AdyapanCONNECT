import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsNumber,
  IsArray, IsDateString, ValidateNested, ArrayMaxSize, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  UNQUALIFIED = 'UNQUALIFIED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

export enum LeadScoreLabel {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT',
  VERY_HOT = 'VERY_HOT',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// ---- Leads ----
export class CreateLeadDto {
  @IsString() @IsNotEmpty()
  contactId: string;

  @IsString() @IsNotEmpty()
  title: string;

  @IsOptional() @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional() @IsInt()
  score?: number;

  @IsOptional() @IsEnum(LeadScoreLabel)
  scoreLabel?: LeadScoreLabel;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  ownerId?: string;

  @IsOptional() @IsNumber()
  value?: number;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];
}

export class UpdateLeadDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional() @IsInt()
  score?: number;

  @IsOptional() @IsEnum(LeadScoreLabel)
  scoreLabel?: LeadScoreLabel;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  ownerId?: string;

  @IsOptional() @IsNumber()
  value?: number;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];
}

// ---- Deals ----
export class CreateDealDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsNotEmpty()
  pipelineId: string;

  @IsString() @IsNotEmpty()
  stageId: string;

  @IsNumber()
  value: number;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsString()
  leadId?: string;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  probability?: number;

  @IsOptional() @IsDateString()
  expectedCloseDate?: string;

  @IsOptional() @IsString()
  ownerId?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];
}

export class UpdateDealDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  pipelineId?: string;

  @IsOptional() @IsString()
  stageId?: string;

  @IsOptional() @IsNumber()
  value?: number;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsString()
  leadId?: string;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  probability?: number;

  @IsOptional() @IsDateString()
  expectedCloseDate?: string;

  @IsOptional() @IsString()
  ownerId?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];
}

// ---- Pipelines ----
export class PipelineStageDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsInt()
  order: number;

  @IsOptional() @IsString()
  color?: string;

  @IsInt() @Min(0) @Max(100)
  probability: number;
}

export class CreatePipelineDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => PipelineStageDto)
  stages: PipelineStageDto[];
}

// ---- Tasks ----
export class CreateTaskDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional() @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsString()
  assignedTo?: string;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsString()
  dealId?: string;

  @IsOptional() @IsString()
  leadId?: string;
}

export class UpdateTaskDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional() @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsString()
  assignedTo?: string;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsString()
  dealId?: string;

  @IsOptional() @IsString()
  leadId?: string;
}
