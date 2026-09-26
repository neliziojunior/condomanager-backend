import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

export interface ParsedSection5 {
  previousBalance: number;
  totalRevenues: number;
  totalExpenses: number;
  currentBalance: number;
  confidence: number;
  rawLines: string[];
}

@Injectable()
export class ReportParserService {
  private readonly logger = new Logger(ReportParserService.name);

  /**
   * Extrai o texto completo de um PDF
   */
  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }

  /**
   * Converte "1.249,91" → 1249.91
   */
  private parseBRNumber(value: string): number {
    if (!value) return 0;
    const cleaned = value
      .trim()
      .replace(/\./g, '')   // remove separador de milhar
      .replace(',', '.');   // vírgula decimal → ponto
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Parser da Seção 5 — Demonstrativo de Receitas e Despesas
   *
   * Padrão esperado no PDF:
   *   "Saldo Anterior. . . . . . . . . . . . 1.249,91"
   *   "RECEITAS. . . . . . . . . . . . . . . 27.563,65"
   *   "Taxas Extra. . . . . . . . . . . . . . 4.300,00"
   *   ...
   *   "DESPESAS. . . . . . . . . . . . . . . 24.817,40"
   *   "Saldo Atual. . . . . . . . . . . . . . 3.996,16"
   */
  parseSection5(fullText: string): ParsedSection5 {
    const result: ParsedSection5 = {
      previousBalance: 0,
      totalRevenues: 0,
      totalExpenses: 0,
      currentBalance: 0,
      confidence: 0,
      rawLines: [],
    };

    // Normaliza: junta linhas quebradas, remove espaços múltiplos
    const lines = fullText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Padrão: "texto. . . . . . . . . valor" ou "texto . . . valor"
    // Aceita tanto "....." quanto ". . . . ." quanto múltiplos espaços
    const valueLineRegex = /^(.+?)[.\s]{2,}([\d.]+,\d{2})\s*$/;

    let foundCount = 0;
    const expected = 4; // previousBalance, totalRevenues, totalExpenses, currentBalance

    for (const line of lines) {
      const match = line.match(valueLineRegex);
      if (!match) continue;

      const label = match[1].trim().toLowerCase();
      const value = this.parseBRNumber(match[2]);

      result.rawLines.push(`${label} => ${value}`);

      // Saldo Anterior
      if (label.includes('saldo anterior')) {
        result.previousBalance = value;
        foundCount++;
        continue;
      }

      // Total de RECEITAS (linha que começa com "receitas")
      if (label === 'receitas' || label.startsWith('receitas ')) {
        result.totalRevenues = value;
        foundCount++;
        continue;
      }

      // Total de DESPESAS
      if (label === 'despesas' || label.startsWith('despesas ')) {
        result.totalExpenses = value;
        foundCount++;
        continue;
      }

      // Saldo Atual
      if (label.includes('saldo atual')) {
        result.currentBalance = value;
        foundCount++;
        continue;
      }
    }

    // Confiança = quantos campos encontramos / quantos esperávamos
    result.confidence = foundCount / expected;

    // Validação matemática: saldoAnterior + receitas - despesas = saldoAtual
    const calculated =
      result.previousBalance + result.totalRevenues - result.totalExpenses;
    const diff = Math.abs(calculated - result.currentBalance);

    if (diff > 0.02 && result.currentBalance > 0) {
      this.logger.warn(
        `Validação falhou: esperado ${calculated}, encontrado ${result.currentBalance} (diff: ${diff})`,
      );
      // Reduz confiança
      result.confidence = Math.max(0, result.confidence - 0.3);
    }

    this.logger.log(
      `Seção 5 extraída: anterior=${result.previousBalance}, receitas=${result.totalRevenues}, despesas=${result.totalExpenses}, atual=${result.currentBalance}, confiança=${result.confidence}`,
    );

    return result;
  }
}
