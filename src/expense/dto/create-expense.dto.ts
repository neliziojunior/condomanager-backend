import {
  IsString, IsNumber, IsDateString, IsOptional, IsUUID,
  IsBoolean, IsInt, Min, Max, MaxLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MaxLength(200)
  description: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  recurringDay?: number;

  // Se enviado com totalInstallments > 1 → gera parcelas
  @IsInt()
  @Min(1)
  @IsOptional()
  totalInstallments?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
