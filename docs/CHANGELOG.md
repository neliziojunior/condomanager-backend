# 📅 Changelog - CondoPro

Todas as mudanças importantes do projeto são documentadas aqui.

## [1.0.0] - 2026-09-16

### Adicionado
- Sistema completo de autenticação (JWT + Google OAuth)
- Cadastro de condomínio via CNPJ (BrasilAPI)
- Gestão de unidades e moradores
- Controle de despesas com sugestão IA
- Folha de pagamento completa (CLT)
- Contabilidade com obrigações fiscais
- Cobranças (Pix/Boleto via Asaas)
- Concierge IA (chatbot)
- CondoScore™ (índice de saúde)
- IA Preditiva (previsão de gastos)
- Multi-perfil (Admin, Condômino, Colaborador)
- Chat entre moradores
- Assembleias digitais
- Enquetes e votações
- Reservas de espaços
- Controle de encomendas
- Visitantes com QR Code
- Achados e Perdidos
- Classificados
- Pets e Veículos
- Documentos com assinatura digital
- Estoque/Almoxarifado
- Funcionários (padrão CTPS)

### Tecnologias
- Backend: NestJS + TypeScript
- Frontend: React + Vite + Material UI
- Banco: PostgreSQL + Prisma
- IA: OpenAI GPT-4o mini
- Deploy: Render + Vercel

## [Em desenvolvimento]

### Próximas versões
- [ ] Pagamentos Pix/Boleto (testes finais)
- [ ] Dashboard multi-condomínio
- [ ] Importação de dados legados
- [ ] PWA (instalar como app)
- [ ] Marca branca (white label)

## Como contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: nova funcionalidade'`)
4. Push (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Versionamento

Seguimos [Semantic Versioning](https://semver.org/):
- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades
- **PATCH**: Correções de bugs
