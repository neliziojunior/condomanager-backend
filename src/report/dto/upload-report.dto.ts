import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadReportDto {
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsOptional()
  sourceType?: string;
}
