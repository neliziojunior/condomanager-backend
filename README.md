# 🏢 CondoPro - Backend

Sistema de gestão condominial profissional com IA.

## 📋 Sobre o Projeto

API REST completa para gestão de condomínios, incluindo:
- Financeiro (despesas, folha de pagamento, contabilidade)
- Operacional (encomendas, manutenção, visitantes)
- Social (assembleias, avisos, chat, enquetes)
- IA (sugestão de categorias, OCR de recibos, previsão de gastos)

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | NestJS |
| Linguagem | TypeScript |
| Banco de Dados | PostgreSQL |
| ORM | Prisma |
| Autenticação | JWT + Google OAuth |
| IA | OpenAI (GPT-4o mini) |
| Pagamentos | Asaas, PJBank, Mercado Pago |

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Docker (opcional)

### Instalação

\`\`\`bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 3. Rodar migrations
npx prisma migrate dev

# 4. Gerar cliente Prisma
npx prisma generate

# 5. Iniciar servidor
npm run start:dev
\`\`\`

Servidor disponível em: http://localhost:3333

## 📁 Estrutura do Projeto

\`\`\`
src/
├── auth/           # Autenticação JWT + Google
├── condominium/    # Gestão de condomínios
├── unit/           # Unidades e moradores
├── expense/        # Despesas
├── employee/       # Funcionários (CTPS)
├── accounting/     # Contabilidade + Obrigações fiscais
├── maintenance/    # Manutenção
├── package/        # Encomendas
├── notice/         # Avisos
├── poll/           # Enquetes
├── assembly/       # Assembleias
├── chat/           # Chat entre moradores
├── visitor/        # Visitantes + QR Code
├── payment/        # Pagamentos (Pix/Boleto)
├── chatbot/        # Concierge IA
├── condoscore/     # Índice de saúde do condomínio
├── condoai/        # IA Preditiva
└── prisma/         # Configuração do banco
\`\`\`

## 🔐 Perfis de Acesso

| Perfil | Role | O que vê |
|--------|------|----------|
| Administrador | SYNDIC / ADMIN | Gestão + Financeiro |
| Condômino | RESIDENT / OWNER | Transparência + Conveniência |
| Colaborador | STAFF | Operacional |

## 🌐 Endpoints Principais

### Auth
- `POST /auth/register` - Cadastro
- `POST /auth/login` - Login
- `GET /auth/google` - Login Google

### Condomínio
- `POST /condominium` - Criar
- `GET /condominium/me` - Buscar
- `PUT /condominium/payment-config` - Configurar pagamento

### Financeiro
- `POST /expenses` - Criar despesa
- `GET /expenses` - Listar
- `POST /employees` - Cadastrar funcionário
- `GET /accounting/relatorio-anual` - Relatório

### IA
- `POST /expenses/suggest-category` - Sugerir categoria
- `GET /condoai/predictions` - Previsão de gastos
- `GET /condoscore` - Índice de saúde

## 🚀 Deploy

Backend hospedado no **Render**: https://condpro.onrender.com

### Variáveis de Ambiente (Produção)

\`\`\`env
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3333
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://condpro.onrender.com/auth/google/callback
FRONTEND_URL=https://condopro-frontend.vercel.app
OPENAI_API_KEY=sk-...
\`\`\`

## 📊 Status do Projeto

| Módulo | Status |
|--------|--------|
| Auth (JWT + Google) | ✅ |
| Condomínios + CNPJ | ✅ |
| Unidades + Moradores | ✅ |
| Despesas + IA | ✅ |
| Folha de Pagamento (CLT) | ✅ |
| Contabilidade | ✅ |
| Cobranças (Pix/Boleto) | ⏳ |
| Multi-condomínio | ⏳ |
| Importação de dados | ⏳ |

## 📝 Licença

Projeto proprietário - Todos os direitos reservados.
