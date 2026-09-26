import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsArray() @IsString({ each: true })
  permissions: string[];

  @IsOptional() @IsDateString()
  expiresAt?: string;
}
