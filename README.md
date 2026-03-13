# Assistente Financeiro DedicarMed

Bot de WhatsApp para gestao financeira com integracao ASAAS + Airtable.

## Funcionalidades

- **Cobrancas**: Criar, listar e cancelar cobrancas via ASAAS
- **Clientes**: Cadastrar e buscar clientes (ASAAS + Airtable)
- **Contratos**: Gerenciar contratos (Airtable)
- **Inadimplencia**: Relatorios de cobrancas em atraso

## Stack

- TypeScript + Node.js 20
- Fastify (HTTP server para webhooks)
- Evolution API (WhatsApp)
- ASAAS API (cobrancas/pagamentos)
- Airtable (dados de clientes/contratos)

## Setup

### Pre-requisitos

- Node.js >= 20
- Docker e Docker Compose
- Conta ASAAS com API key
- Conta Airtable com Personal Access Token
- Evolution API configurada

### Instalacao

```bash
# Instalar dependencias
npm install

# Copiar e configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Desenvolvimento
npm run dev

# Build
npm run build

# Producao
npm start
```

### Docker

```bash
# Subir todos os servicos
docker compose up -d

# Verificar logs
docker compose logs -f assistente

# Parar
docker compose down
```

### Configurar Webhook no Evolution API

Apos subir os servicos, configure o webhook da instancia Evolution API para apontar para:

```
http://assistente:3000/webhook/evolution
```

Eventos necessarios: `messages.upsert`

## Estrutura do Projeto

```
src/
  config/       - Configuracao e validacao de env vars
  server/       - Fastify server e rotas
  whatsapp/     - Evolution API client, parser e sender
  conversation/ - State machine, sessoes e fluxos
  services/     - Logica de negocio
  integrations/ - Clients para ASAAS e Airtable
  auth/         - Guard de operadores permitidos
  shared/       - Logger, errors, retry, formatters
  types/        - Interfaces e tipos TypeScript
```

## Comandos do Bot

| Comando | Acao |
|---------|------|
| `menu` ou `0` | Voltar ao menu principal |
| `cancelar` | Cancelar operacao atual |
| `ajuda` | Mostrar comandos disponiveis |

## Scripts

| Script | Descricao |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento (hot reload) |
| `npm run build` | Compila TypeScript |
| `npm start` | Inicia versao compilada |
| `npm test` | Roda testes |
| `npm run lint` | Verifica linting |
