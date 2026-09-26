import { IsString, IsOptional } from 'class-validator';

/**
 * Fields a user may change on their own profile. Excludes email,
 * passwordHash, status, emailVerified, role, and every other sensitive column.
 */
export class UpdateProfileDto {
  @IsOptional() @IsString()
  firstName?: string;

  @IsOptional() @IsString()
  lastName?: string;

  @IsOptional() @IsString()
  displayName?: string;

  @IsOptional() @IsString()
  phoneNumber?: string;
}
