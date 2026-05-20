import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Controller('expenses/ocr')
@UseGuards(JwtAuthGuard)
export class ExpenseOcrController {
  private openai: OpenAI;

  constructor(
    private expenseService: ExpenseService,
    private prisma: PrismaService,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder' });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({ destination: './uploads/recibos', filename: (req, file, cb) => {
      const name = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, name + '.jpg');
    }}),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async scanReceipt(@UploadedFile() file: Express.Multer.File, @Req() req) {
    // Converter imagem para base64
    const fs = require('fs');
    const imageBase64 = fs.readFileSync(file.path, { encoding: 'base64' });

    // Chamar IA para extrair dados do recibo
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Você é um extrator de dados de recibos. Extraia: descrição, valor, data, estabelecimento. Retorne APENAS JSON válido no formato: {"description":"...","amount":0,"date":"...","establishment":"..."}' 
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extraia os dados deste recibo:' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      max_tokens: 200,
    });

    let extractedData;
    try {
      const content = completion.choices[0].message.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      extractedData = null;
    }

    if (!extractedData?.amount) {
      return { success: false, message: 'Não foi possível extrair os dados do recibo' };
    }

    // Buscar categoria automaticamente
    const categories = await this.prisma.accountCategory.findMany({
      where: { condominiumId: req.user.condominiumId, type: 'EXPENSE' },
    });
    const category = categories[0]; // Usar primeira categoria como padrão

    // Criar despesa automaticamente
    const expense = await this.expenseService.create({
      description: `${extractedData.establishment || 'Recibo'} - ${extractedData.description}`,
      amount: extractedData.amount,
      dueDate: extractedData.date || new Date().toISOString(),
      categoryId: category?.id,
      documentUrl: `/uploads/recibos/${file.filename}`,
    }, req.user.condominiumId);

    return {
      success: true,
      expense,
      extracted: extractedData,
    };
  }
}
