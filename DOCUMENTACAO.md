# 📖 Documentação Técnica - CondoPro

## 🎯 Visão Geral

CondoPro é um SaaS de gestão condominial profissional desenvolvido para:
- **Síndicos** (gestão do dia a dia)
- **Escritórios de Contabilidade** (gestão multi-condomínio)
- **Administradoras** (gestão em escala)

## 🏗️ Arquitetura

### Frontend (React + Vite)
- Hospedado na **Vercel**
- Material UI para componentes
- Recharts para gráficos
- Axios para chamadas HTTP

### Backend (NestJS)
- Hospedado no **Render**
- Prisma ORM
- JWT + Google OAuth
- Integração OpenAI

### Banco de Dados (PostgreSQL)
- Hospedado no **Render**
- Backup automático
- Multi-tenant (cada condomínio isolado)

## 📊 Modelo de Dados

### Entidades Principais

\`\`\`
Condominium (1)
    ├── Unit (N)
    │   ├── Person (N) - moradores
    │   ├── Expense (N)
    │   ├── Package (N)
    │   └── Reservation (N)
    ├── Employee (N)
    ├── Assembly (N)
    ├── Notice (N)
    └── ChatMessage (N)
\`\`\`

### Campos Importantes

**Condominium:**
- `paymentProvider` - Provedor de pagamento (ASAAS, PJBank, etc)
- `paymentApiKey` - Chave criptografada
- `cnpj` - CNPJ do condomínio

**Person:**
- `role` - SYNDIC, RESIDENT, OWNER, STAFF
- `syndicOfId` - Condomínio que administra
- `unitId` - Unidade que mora

**Employee:**
- Dados completos no padrão CTPS
- `salarioBase`, `periculosidade`, `adicionalNoturno`
- `fgtsEmpresa`, `inssEmpresa`, `irrf`

## 🔐 Segurança

### Autenticação
- JWT com expiração de 7 dias
- Google OAuth 2.0
- Senhas com bcrypt (10 rounds)

### Autorização
- Guards por role
- Cada usuário vê apenas seu condomínio

### Criptografia
- API Keys dos provedores criptografadas
- Nunca expostas no frontend

## 💳 Integrações

### Provedores de Pagamento
| Provedor | Status |
|----------|--------|
| Asaas | ✅ Implementado |
| PJBank | ⏳ Estrutura pronta |
| Mercado Pago | ⏳ Estrutura pronta |

### APIs Externas
- **BrasilAPI** - Consulta CNPJ
- **OpenAI** - IA (categorização, OCR, previsão)

## 📈 Funcionalidades Principais

### 1. Gestão Financeira
- Lançamento de despesas com IA
- Folha de pagamento completa (CLT)
- Geração de guias (DAS, GPS, FGTS)
- Relatórios anuais

### 2. Operacional
- Controle de encomendas
- Gestão de visitantes (QR Code)
- Manutenção preventiva
- Reservas de espaços

### 3. Social
- Assembleias digitais
- Enquetes e votações
- Chat entre moradores
- Mural de avisos

### 4. IA
- CondoScore™ (índice de saúde)
- Previsão de gastos
- Categorização automática
- OCR de recibos

## 🚀 Deploy

### Backend (Render)
1. Conectar repositório GitHub
2. Build: `npm install && npx prisma generate && npm run build`
3. Start: `node dist/main.js`
4. Adicionar variáveis de ambiente

### Frontend (Vercel)
1. Conectar repositório GitHub
2. Build: `npm run build`
3. Output: `dist`
4. Adicionar `VITE_API_URL`

## 📝 Fluxo de Desenvolvimento

\`\`\`bash
# 1. Criar branch
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver
npm run start:dev

# 3. Testar
npm run test

# 4. Commit
git add . && git commit -m "feat: nova funcionalidade"

# 5. Push (deploy automático)
git push
\`\`\`

## 🧪 Testes

\`\`\`bash
# Backend
npm run test

# Frontend
npm run test
\`\`\`

## 📊 Monitoramento

- **Render**: Logs em tempo real
- **Vercel**: Analytics
- **PostgreSQL**: Backup diário

## 🔄 Roadmap

### V1.0 (MVP - Concluído)
- ✅ Autenticação
- ✅ Gestão básica
- ✅ Financeiro
- ✅ IA básica

### V1.5 (Em desenvolvimento)
- ⏳ Pagamentos reais
- ⏳ Multi-condomínio
- ⏳ Importação de dados

### V2.0 (Futuro)
- 📱 App mobile nativo
- 🔐 Reconhecimento facial
- 🏢 Rede entre condomínios
- 🎮 Gamificação

## 📞 Suporte

- Documentação: [link]
- Email: suporte@condopro.com.br
- WhatsApp: (00) 00000-0000

## 📄 Licença

Projeto proprietário - Todos os direitos reservados.
