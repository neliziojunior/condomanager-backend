import { IsString, IsNumber, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  unitId?: string;
}


