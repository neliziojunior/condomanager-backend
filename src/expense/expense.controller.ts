import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, SuggestCategoryDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto, @Req() req) {
    return this.expenseService.create(dto, req.user.condominiumId);
  }

  @Post('suggest-category')
  suggestCategory(@Body() dto: SuggestCategoryDto, @Req() req) {
    return this.expenseService.suggestCategory(dto, req.user.condominiumId);
  }

  @Get()
  getAll(@Req() req) {
    return this.expenseService.findAll(req.user.condominiumId);
  }
}