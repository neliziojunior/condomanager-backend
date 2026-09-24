import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class MarkPaidDto {
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;
}
