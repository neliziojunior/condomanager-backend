# 1. Crie o arquivo README.md
cat > README.md << 'EOF'
# CondoManager Backend

API de gestão condominial com NestJS, Prisma, PostgreSQL e OpenAI.

## Requisitos
- Node.js 18+
- PostgreSQL 14+
- Chave API OpenAI

## Instalação
```bash
npm install
cp .env.example .env  # edite com suas credenciais
npx prisma generate
npx prisma migrate dev
npm run start:dev
