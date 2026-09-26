import {
  IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsIn,
} from 'class-validator';

export class CreateSegmentDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsArray()
  conditions: any[];

  @IsOptional() @IsIn(['AND', 'OR'])
  conditionOperator?: string;

  @IsOptional() @IsBoolean()
  isDynamic?: boolean;
}
