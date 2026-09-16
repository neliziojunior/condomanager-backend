# 📖 Manual do Usuário - CondoPro

Bem-vindo ao CondoPro! Este manual vai te ajudar a usar todas as funcionalidades do sistema.

## 🚀 Primeiros Passos

### 1. Criar Conta

1. Acesse o sistema: https://condopro-frontend.vercel.app
2. Clique em **"Entrar com Google"** (recomendado) ou use email/senha
3. Escolha uma conta Google com permissão de síndico

### 2. Cadastrar Condomínio

1. Após login, você será redirecionado para o cadastro
2. Digite o **CNPJ** do condomínio
3. Clique em **"Buscar"**
4. Os dados serão preenchidos automaticamente
5. Complete com a **taxa condominial**
6. Clique em **"Cadastrar"**

### 3. Cadastrar Unidades

1. Vá em **Gestão → Unidades**
2. Clique em **"Nova Unidade"**
3. Preencha:
   - Bloco/Torre (ex: A)
   - Número (ex: 101)
   - Andar
   - Tipo (Apartamento, Casa, Comercial)
   - Área
4. Clique em **"Criar"**

### 4. Adicionar Moradores

1. Na unidade, clique em **"Morador"**
2. Preencha:
   - Nome completo
   - Email
   - Telefone
3. Escolha: **Proprietário** ou **Inquilino**
4. Clique em **"Adicionar"**

## 💰 Gestão Financeira

### Lançar Despesa

1. Vá em **Financeiro → Despesas**
2. Clique em **"Nova Despesa"**
3. Digite a descrição (ex: "Conta de luz")
4. Clique em **"🤖 Sugerir Categoria"**
5. A IA vai sugerir a categoria
6. Preencha valor e vencimento
7. Clique em **"Salvar"**

### Cadastrar Funcionário

1. Vá em **Gestão → Funcionários**
2. Clique em **"Novo Funcionário"**
3. Preencha as 6 abas:
   - 📋 Pessoal
   - 📄 Documentos
   - 🏠 Residência
   - 💼 Contrato
   - ⚙️ Adicionais
   - 🌴 Férias
4. Clique em **"Cadastrar"**

### Calcular Folha de Pagamento

1. Vá em **Financeiro → Folha de Pagamento**
2. Clique em **"Calcular Tudo"**
3. O sistema calcula automaticamente:
   - INSS
   - IRRF
   - FGTS
   - Provisões (férias, 13º)
   - Periculosidade (30%)
   - Insalubridade (10/20/40%)

## 🔧 Gestão Operacional

### Registrar Encomenda

1. Vá em **Operacional → Encomendas**
2. Clique em **"Registrar Encomenda"**
3. Selecione a unidade
4. Descreva a encomenda
5. Clique em **"Gerar Código"** (para retirada)
6. Clique em **"Registrar"**

### Gerenciar Visitantes

1. Vá em **Operacional → Visitantes**
2. Clique em **"Registrar Visitante"**
3. Preencha:
   - Unidade do morador
   - Nome do visitante
   - Documento
4. Clique em **"Gerar QR Code"**
5. O visitante apresenta o QR Code na portaria

### Abrir Chamado de Manutenção

1. Vá em **Gestão → Manutenção**
2. Clique em **"Novo Chamado"**
3. Preencha:
   - Título
   - Descrição
   - Unidade
   - Prioridade (Baixa, Média, Alta, Urgente)
4. Clique em **"Criar Chamado"**

## 👥 Comunicação

### Publicar Aviso

1. Vá em **Social → Avisos**
2. Clique em **"Novo Aviso"**
3. Preencha título e conteúdo
4. Escolha categoria (Geral, Urgente, Evento)
5. Clique em **"Publicar"**

### Criar Enquete

1. Vá em **Social → Enquetes**
2. Clique em **"Nova Enquete"**
3. Preencha:
   - Título
   - Descrição
   - Opções (mínimo 2)
4. Clique em **"Criar"**
5. Moradores votam e o resultado aparece em tempo real

### Convocar Assembleia

1. Vá em **Social → Assembleias**
2. Clique em **"Nova Assembleia"**
3. Preencha:
   - Título
   - Pauta
   - Data e hora
   - Local
4. Clique em **"Criar e Notificar"**
5. Moradores recebem notificação para confirmar presença
6. Após a assembleia, baixe a **Ata em PDF**

## 🤖 Inteligência Artificial

### Concierge IA

1. Vá em **IA → Concierge IA**
2. Digite sua pergunta:
   - "Qual o horário da piscina?"
   - "Como reservar o salão de festas?"
   - "Quando é a próxima assembleia?"
3. A IA responde com base nos dados do condomínio

### CondoScore™

O **CondoScore™** é um índice de 0 a 100 que mede a saúde do condomínio:

| Pontuação | Categoria |
|-----------|-----------|
| 85-100 | 🟢 Excelente |
| 70-84 | 🔵 Bom |
| 50-69 | 🟡 Regular |
| 0-49 | 🔴 Crítico |

**Fatores considerados:**
- 💰 Financeiro (40 pontos)
- 🔧 Manutenção (25 pontos)
- 👥 Participação (20 pontos)
- ⚖️ Compliance (15 pontos)

## 💳 Configurar Pagamentos

### Asaas (Pix/Boleto)

1. Crie uma conta no [Asaas](https://www.asaas.com)
2. Vá em **Integrações → Chave de API**
3. Copie a chave
4. No CondoPro:
   - Vá em **Configurações**
   - Escolha o provedor
   - Cole a API Key
   - Clique em **"Testar Conexão"**
   - Clique em **"Salvar"**

### Gerar Boleto/Pix

1. Vá em **Financeiro → Cobranças**
2. Escolha Pix ou Boleto
3. Selecione a unidade
4. Preencha descrição, valor e vencimento
5. Clique em **"Gerar"**
6. Envie por WhatsApp ou Email

## 🔐 Segurança

### Perfis de Acesso

| Perfil | O que pode fazer |
|--------|------------------|
| 👔 Admin | Tudo |
| 👤 Condômino | Ver transparência, reservar espaços, votar |
| 🔑 Colaborador | Encomendas, visitantes, manutenção |

### Boas Práticas

- ✅ Use senha forte
- ✅ Ative autenticação em 2 fatores (quando disponível)
- ✅ Não compartilhe sua conta
- ✅ Faça logout ao usar computador público

## 📞 Suporte

- 📧 Email: suporte@condopro.com.br
- 💬 WhatsApp: (00) 00000-0000
- 📚 Documentação: [link]

## 🎓 Tutoriais em Vídeo

- [Como cadastrar um condomínio]
- [Como lançar despesas]
- [Como cadastrar funcionários]
- [Como gerar boletos]

---

**CondoPro** - Gestão Profissional de Condomínios 🏢
