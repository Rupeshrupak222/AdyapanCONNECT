import { IsString, IsNotEmpty, IsArray, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  @IsUrl({ require_tld: false })
  url: string;

  @IsArray() @IsString({ each: true })
  events: string[];
}
