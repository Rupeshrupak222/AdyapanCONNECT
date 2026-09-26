import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, Min } from 'class-validator';

export class VerifyPaymentDto {
  @IsString() @IsNotEmpty()
  razorpay_order_id: string;

  @IsString() @IsNotEmpty()
  razorpay_payment_id: string;

  @IsString() @IsNotEmpty()
  razorpay_signature: string;

  @IsIn(['plan', 'wallet'])
  type: 'plan' | 'wallet';

  @IsOptional() @IsString()
  planId?: string;

  @IsOptional() @IsNumber() @Min(1)
  amount?: number;
}
