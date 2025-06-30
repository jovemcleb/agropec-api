# 🚀 API Agropec

API RESTful para gerenciamento de eventos agropecuários, desenvolvida com Fastify, TypeScript e MongoDB.

## 📋 Índice

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração](#configuração)
- [Interfaces e Schemas](#interfaces-e-schemas)
- [Autenticação](#autenticação)
- [Rotas de Administradores](#rotas-de-administradores)
- [Rotas de Usuários](#rotas-de-usuários)
- [Rotas de Notificações de Usuário](#rotas-de-notificações-de-usuário)
- [Rotas de Atividades](#rotas-de-atividades)
- [Rotas de Stands](#rotas-de-stands)
- [Rotas de Categorias](#rotas-de-categorias)
- [Rotas de Empresas](#rotas-de-empresas)
- [Rotas de Notificações](#rotas-de-notificações)
- [Rotas de Programação](#rotas-de-programação)
- [WebSocket](#websocket)

## 📁 Estrutura do Projeto

```
src/
├── controllers/          # Controladores das rotas
├── handlers/            # Handlers de erro
├── interfaces/          # Schemas e tipos Zod
├── plugins/             # Plugins do Fastify
├── repositories/        # Camada de acesso a dados
├── routes/              # Definição das rotas
├── scripts/             # Scripts utilitários
├── services/            # Lógica de negócio
├── types/               # Tipos TypeScript
├── useCases/            # Casos de uso
├── utils/               # Utilitários
└── index.ts             # Ponto de entrada
```

### Arquitetura

- **Clean Architecture**: Separação clara entre camadas
- **Repository Pattern**: Abstração do acesso a dados
- **Use Case Pattern**: Lógica de negócio isolada
- **Plugin System**: Funcionalidades modulares
- **Type Safety**: TypeScript em toda a aplicação

## ⚙️ Configuração

### Variáveis de Ambiente

**⚠️ IMPORTANTE: Todas as variáveis marcadas como obrigatórias devem ser configuradas antes de executar a aplicação.**

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=agropec

# JWT (OBRIGATÓRIO)
JWT_SECRET=sua_chave_secreta_super_segura_aqui_com_pelo_menos_32_caracteres
JWT_EXPIRES_IN=1d

# AWS S3
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu_bucket_name
```

### Configuração de Segurança

#### JWT_SECRET (Obrigatório)

O `JWT_SECRET` é **obrigatório** para o funcionamento da aplicação. Use uma chave longa e aleatória:

```bash
# Gerar chave segura (escolha uma opção):

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64

# Python
python -c "import secrets; print(secrets.token_hex(64))"
```

**Exemplo de JWT_SECRET seguro:**

```env
JWT_SECRET=f8a2b9c1d4e6f7a8b2c5d8e9f1a4b7c9d2e5f8a1b4c7d9e2f5a8b1c4d7e9f2a5b8c1d4e6f7a8
```

⚠️ **NUNCA** use valores como `"secret"`, `"123456"` ou compartilhe sua chave secreta!

### Instalação

```bash
# 1. Instalar dependências
yarn install

# 2. Configurar variáveis de ambiente (OBRIGATÓRIO)
cp .env.example .env
# Edite o arquivo .env e configure JWT_SECRET e outras variáveis

# 3. Criar primeiro administrador
yarn ts-node src/scripts/create-first-admin.ts

# 4. Executar em desenvolvimento
yarn dev

# 5. Executar em produção
yarn build && yarn start
```

**⚠️ IMPORTANTE:** A aplicação **não iniciará** se `JWT_SECRET` não estiver configurado.

## 📋 Interfaces e Schemas

A API utiliza Zod para validação de dados. Cada rota utiliza schemas específicos para validar a entrada e saída de dados.

### Schemas de Usuários

#### `CreateUserSchema`

```typescript
{
  firstName: string; // Nome (obrigatório)
  lastName: string; // Sobrenome (obrigatório)
  email: string; // Email válido (obrigatório)
  password: string; // Senha com mínimo 8 caracteres (obrigatório)
}
```

#### `LoginUserSchema`

```typescript
{
  email: string; // Email (obrigatório)
  password: string; // Senha (obrigatório)
}
```

#### `UpdateUserSchema`

```typescript
{
  uuid: string;          // UUID do usuário (obrigatório)
  firstName?: string;    // Nome (opcional)
  lastName?: string;     // Sobrenome (opcional)
  email?: string;        // Email válido (opcional)
  password?: string;     // Senha com mínimo 8 caracteres (opcional)
}
```

#### `UserActivitiesSchema`

```typescript
{
  activitiesId: string[]; // Array de UUIDs das atividades
}
```

#### `UserStandsSchema`

```typescript
{
  standsId: string[];    // Array de UUIDs dos stands
}
```

### Schemas de Administradores

#### `CreateAdminSchema`

```typescript
{
  firstName: string; // Nome (obrigatório)
  lastName: string; // Sobrenome (obrigatório)
  email: string; // Email válido (obrigatório)
  password: string; // Senha com mínimo 8 caracteres (obrigatório)
}
```

#### `LoginAdminSchema`

```typescript
{
  email: string; // Email (obrigatório)
  password: string; // Senha (obrigatório)
}
```

#### `UpdateAdminSchema`

```typescript
{
  uuid: string;          // UUID do admin (obrigatório)
  firstName?: string;    // Nome (opcional)
  lastName?: string;     // Sobrenome (opcional)
  email?: string;        // Email válido (opcional)
  password?: string;     // Senha com mínimo 8 caracteres (opcional)
}
```

### Schemas de Atividades

#### `CreateActivitySchema`

```typescript
{
  name: string; // Nome da atividade (obrigatório)
  description: string; // Descrição (obrigatório)
  categoryId: string; // UUID da categoria (obrigatório)
  companyId: string; // UUID da empresa (obrigatório)
  date: string; // Data no formato dd/mm/yyyy (obrigatório)
  startTime: string; // Horário início HH:MM (obrigatório)
  endTime: string; // Horário fim HH:MM (obrigatório)
}
```

#### `CreateActivityRequestSchema` (multipart/form-data)

```typescript
{
  ...CreateActivitySchema;
  images?: File[];       // Arquivos de imagem (opcional)
}
```

#### `UpdateActivitySchema`

```typescript
{
  uuid: string;          // UUID da atividade (obrigatório)
  name?: string;         // Nome (opcional)
  description?: string;  // Descrição (opcional)
  categoryId?: string;   // UUID da categoria (opcional)
  companyId?: string;    // UUID da empresa (opcional)
  date?: string;         // Data dd/mm/yyyy (opcional)
  startTime?: string;    // Horário início HH:MM (opcional)
  endTime?: string;      // Horário fim HH:MM (opcional)
}
```

### Schemas de Stands

#### `CreateStandSchema`

```typescript
{
  name: string; // Nome do stand (obrigatório)
  description: string; // Descrição (obrigatório)
  categoryId: string; // UUID da categoria (obrigatório)
  companyId: string; // UUID da empresa (obrigatório)
  date: string; // Data no formato dd/mm/yyyy (obrigatório)
  openingTime: string; // Horário abertura HH:MM (obrigatório)
  closingTime: string; // Horário fechamento HH:MM (obrigatório)
}
```

#### `CreateStandRequestSchema` (multipart/form-data)

```typescript
{
  ...CreateStandSchema;
  images?: File[];       // Arquivos de imagem (opcional)
}
```

#### `UpdateStandSchema`

```typescript
{
  uuid: string;          // UUID do stand (obrigatório)
  name?: string;         // Nome (opcional)
  description?: string;  // Descrição (opcional)
  categoryId?: string;   // UUID da categoria (opcional)
  companyId?: string;    // UUID da empresa (opcional)
  date?: string;         // Data dd/mm/yyyy (opcional)
  openingTime?: string;  // Horário abertura HH:MM (opcional)
  closingTime?: string;  // Horário fechamento HH:MM (opcional)
}
```

### Schemas de Categorias

#### `CreateCategorySchema`

```typescript
{
  name: string; // Nome da categoria (obrigatório)
}
```

### Schemas de Empresas

#### `CreateCompanySchema`

```typescript
{
  name: string; // Nome da empresa (obrigatório)
  description: string; // Descrição da empresa (obrigatório)
}
```

#### `UpdateCompanySchema`

```typescript
{
  uuid: string;          // UUID da empresa (obrigatório)
  name?: string;         // Nome (opcional)
  description?: string;  // Descrição (opcional)
}
```

### Schemas de Notificações

#### `CreateNotificationSchema`

```typescript
{
  title: string;                    // Título (obrigatório)
  message: string;                  // Mensagem (obrigatório)
  type: "announcement" | "alert" | "system" | "event"; // Tipo (obrigatório)
  isScheduled?: boolean;            // Se é agendada (padrão: false)
  status?: "pending" | "delivered" | "read"; // Status (padrão: "pending")
  date: string;                     // Data dd/mm/yyyy (obrigatório)
  time: string;                     // Horário HH:MM (obrigatório)
  expiresAt?: Date;                 // Data de expiração (opcional)
  targetAudience?: ("all" | "admin" | "exhibitors" | "visitors" | "staff")[]; // Audiência (padrão: ["all"])
}
```

#### `UpdateNotificationSchema`

```typescript
{
  uuid: string;                     // UUID da notificação (obrigatório)
  title?: string;                   // Título (opcional)
  message?: string;                 // Mensagem (opcional)
  type?: "announcement" | "alert" | "system" | "event"; // Tipo (opcional)
  isScheduled?: boolean;            // Se é agendada (opcional)
  status?: "pending" | "delivered" | "read"; // Status (opcional)
  date?: string;                    // Data dd/mm/yyyy (opcional)
  time?: string;                    // Horário HH:MM (opcional)
  expiresAt?: Date;                 // Data de expiração (opcional)
  targetAudience?: ("all" | "admin" | "exhibitors" | "visitors" | "staff")[]; // Audiência (opcional)
}
```

### Schemas de Programação

#### `ScheduleItemSchema`

```typescript
{
  type: "activity" | "stand";      // Tipo do item (obrigatório)
  uuid: string;                    // UUID do item (obrigatório)
  name: string;                    // Nome (obrigatório)
  description: string;             // Descrição (obrigatório)
  date: string;                    // Data dd/mm/yyyy (obrigatório)
  startTime?: string;              // Horário início HH:MM (atividades)
  endTime?: string;                // Horário fim HH:MM (atividades)
  openingTime?: string;            // Horário abertura HH:MM (stands)
  closingTime?: string;            // Horário fechamento HH:MM (stands)
  categoryId: string;              // UUID da categoria (obrigatório)
  companyId: string;               // UUID da empresa (obrigatório)
  imageUrls?: string[];            // URLs das imagens (opcional)
}
```

### Validação de Dados

- **Datas**: Formato obrigatório `dd/mm/yyyy` com validação de data válida
- **Horários**: Formato obrigatório `HH:MM` (24 horas)
- **UUIDs**: Validação de formato UUID válido
- **Emails**: Validação de formato de email válido
- **URLs**: Validação de formato de URL válido para imagens
- **Senhas**: Mínimo 8 caracteres
- **Strings**: Campos de texto não podem estar vazios

### Como Usar os Schemas

Cada rota que aceita dados de entrada possui um schema específico indicado na documentação. Os schemas definidos com Zod garantem:

1. **Validação automática**: Dados inválidos são rejeitados automaticamente
2. **Mensagens de erro claras**: Erros de validação retornam mensagens específicas em português
3. **Type safety**: TypeScript verifica os tipos em tempo de desenvolvimento
4. **Transformação de dados**: Campos opcionais recebem valores padrão quando aplicável

**Exemplo de erro de validação:**

```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "code": "invalid_string",
      "message": "Email inválido",
      "path": ["email"]
    }
  ]
}
```

### Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev          # Executa em modo desenvolvimento com hot reload
yarn build        # Compila o projeto TypeScript
yarn start        # Executa em modo produção
yarn lint         # Executa o linter ESLint
yarn clean        # Remove a pasta dist

# Banco de dados
yarn db:seed:admin # Cria o primeiro administrador no banco
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para rotas protegidas, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

### Níveis de Acesso

- **SUPER_ADMIN**: Acesso total ao sistema, pode gerenciar outros administradores
- **admin**: Pode gerenciar recursos mas não outros administradores
- **user**: Usuário comum, acesso limitado

### Estratégias de Autorização

A API utiliza diferentes estratégias de autorização:

- **`anyAdmin`**: Requer qualquer nível de admin (SUPER_ADMIN ou admin)
- **`superAdmin`**: Requer especificamente SUPER_ADMIN
- **`self`**: Usuário só pode acessar seus próprios recursos
- **`selfOrAnyAdmin`**: Usuário pode acessar seus recursos ou qualquer admin pode acessar
- **`selfOrSuperAdmin`**: Usuário pode acessar seus recursos ou SUPER_ADMIN pode acessar
- **`authenticated`**: Requer apenas autenticação (qualquer usuário logado)

### CORS

A API está configurada com CORS para permitir requisições de:

- `http://localhost:3000`
- `http://localhost:5173`

Headers permitidos:

- `Content-Type`
- `Authorization`
- `Origin`
- `Accept`
- `Content-Length`
- `x-requested-with`

Headers expostos:

- `Content-Disposition`

## 👨‍💼 Rotas de Administradores

### POST /admin/login

**Autenticação:** Não requerida  
**Schema:** `LoginAdminSchema`

**Body:**

```json
{
  "email": "admin@agropec.com",
  "password": "senha123"
}
```

**Resposta (200):**

```json
{
  "admin": {
    "uuid": "uuid-do-admin",
    "email": "admin@agropec.com",
    "firstName": "Nome",
    "lastName": "Sobrenome",
    "role": "SUPER_ADMIN"
  },
  "token": "jwt_token_aqui"
}
```

### POST /admin/signup

**Autenticação:** Requer SUPER_ADMIN  
**Schema:** `CreateAdminSchema`

**Body:**

```json
{
  "firstName": "Nome",
  "lastName": "Sobrenome",
  "email": "novo@admin.com",
  "password": "senha123"
}
```

**Resposta (201):**

```json
{
  "admin": {
    "uuid": "uuid-do-admin",
    "email": "novo@admin.com",
    "firstName": "Nome",
    "lastName": "Sobrenome",
    "role": "admin"
  },
  "token": "jwt_token_aqui"
}
```

### GET /admins

**Autenticação:** Requer admin

**Resposta (200):**

```json
[
  {
    "uuid": "uuid-do-admin",
    "firstName": "Nome",
    "lastName": "Sobrenome",
    "email": "admin@agropec.com",
    "role": "SUPER_ADMIN"
  }
]
```

### PUT /admin/:uuid

**Autenticação:** Requer self ou admin  
**Schema:** `UpdateAdminSchema`

**Body:**

```json
{
  "uuid": "uuid-do-admin",
  "firstName": "Nome Atualizado",
  "lastName": "Sobrenome Atualizado",
  "email": "email@atualizado.com",
  "password": "nova_senha"
}
```

**Resposta (200):**

```json
{
  "uuid": "uuid-do-admin",
  "firstName": "Nome Atualizado",
  "lastName": "Sobrenome Atualizado",
  "email": "email@atualizado.com",
  "role": "admin"
}
```

### DELETE /admin/:uuid

**Autenticação:** Requer SUPER_ADMIN

**Resposta (200):**

```json
{
  "success": true,
  "message": "Admin deleted successfully",
  "deletedCount": 1
}
```

### GET /admin/validate

**Autenticação:** Requer token válido de admin

**Resposta (200):**

```json
{
  "admin": {
    "uuid": "uuid-do-admin",
    "email": "admin@agropec.com",
    "firstName": "Nome",
    "lastName": "Sobrenome",
    "role": "SUPER_ADMIN"
  },
  "token": "jwt_token_aqui"
}
```

**Nota:** Esta rota valida o token de administrador fornecido no header Authorization e retorna os dados do admin se o token for válido.

## 👤 Rotas de Usuários

### POST /users/login

**Autenticação:** Não requerida  
**Schema:** `LoginUserSchema`

**Body:**

```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Resposta (200):**

```json
{
  "user": {
    "uuid": "uuid-do-usuario",
    "email": "usuario@email.com",
    "firstName": "Nome",
    "lastName": "Sobrenome",
    "role": "user",
    "activitiesId": ["uuid-atividade-1"],
    "standsId": ["uuid-stand-1"]
  },
  "token": "jwt_token_aqui"
}
```

### POST /users/signup

**Autenticação:** Não requerida  
**Schema:** `CreateUserSchema`

**Body:**

```json
{
  "firstName": "Nome",
  "lastName": "Sobrenome",
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Resposta (201):**

```json
{
  "user": {
    "uuid": "uuid-do-usuario",
    "email": "usuario@email.com",
    "firstName": "Nome",
    "lastName": "Sobrenome",
    "role": "user",
    "activitiesId": [],
    "standsId": []
  },
  "token": "jwt_token_aqui"
}
```

### GET /users

**Autenticação:** Requer admin

**Resposta (200):**

```json
{
  "success": true,
  "message": "Usuários encontrados com sucesso",
  "data": [
    {
      "uuid": "uuid-do-usuario",
      "firstName": "Nome",
      "lastName": "Sobrenome",
      "email": "usuario@email.com",
      "role": "user",
      "activitiesId": ["uuid-atividade-1"],
      "standsId": ["uuid-stand-1"]
    }
  ]
}
```

### PATCH /users/:uuid/activities

**Autenticação:** Requer self  
**Schema:** `UserActivitiesSchema`

**Body:**

```json
{
  "activitiesId": ["uuid-atividade-1", "uuid-atividade-2"]
}
```

**Resposta (200):**

```json
{
  "uuid": "uuid-do-usuario",
  "firstName": "Nome",
  "lastName": "Sobrenome",
  "email": "usuario@email.com",
  "role": "user",
  "activitiesId": ["uuid-atividade-1", "uuid-atividade-2"],
  "standsId": ["uuid-stand-1"]
}
```

### PATCH /users/:uuid/stands

**Autenticação:** Requer self  
**Schema:** `UserStandsSchema`

**Body:**

```json
{
  "standsId": ["uuid-stand-1", "uuid-stand-2"]
}
```

**Resposta (200):**

```json
{
  "uuid": "uuid-do-usuario",
  "firstName": "Nome",
  "lastName": "Sobrenome",
  "email": "usuario@email.com",
  "role": "user",
  "activitiesId": ["uuid-atividade-1"],
  "standsId": ["uuid-stand-1", "uuid-stand-2"]
}
```

### PATCH /users/:uuid/activities/remove

**Autenticação:** Requer self  
**Schema:** `UserActivitiesSchema`

**Body:**

```json
{
  "activitiesId": ["uuid-atividade-1"]
}
```

### PATCH /users/:uuid/stands/remove

**Autenticação:** Requer self  
**Schema:** `UserStandsSchema`

**Body:**

```json
{
  "standsId": ["uuid-stand-1"]
}
```

### PATCH /users/:uuid

**Autenticação:** Requer self  
**Schema:** `UpdateUserSchema`

**Body:**

```json
{
  "uuid": "uuid-do-usuario",
  "firstName": "Nome Atualizado",
  "lastName": "Sobrenome Atualizado",
  "email": "email@atualizado.com",
  "password": "nova_senha"
}
```

### DELETE /users/:uuid

**Autenticação:** Requer self

**Resposta (200):**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "deletedCount": 1
}
```

### GET /users/validate

**Autenticação:** Requer token válido

**Resposta (200):**

```json
{
  "user": {
    "uuid": "uuid-do-usuario",
    "email": "usuario@email.com",
    "firstName": "Nome",
    "lastName": "Sobrenome",
    "role": "user",
    "activitiesId": ["uuid-atividade-1"],
    "standsId": ["uuid-stand-1"]
  },
  "token": "jwt_token_aqui"
}
```

**Nota:** Esta rota valida o token fornecido no header Authorization e retorna os dados do usuário se o token for válido.

## 🔔 Rotas de Notificações de Usuário

### GET /users/:uuid/notifications

**Autenticação:** Requer self

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificações do usuário encontradas",
  "data": [
    {
      "uuid": "uuid-da-notificacao",
      "userId": "uuid-do-usuario",
      "message": "A atividade 'Palestra sobre Agricultura' começará em 30 minutos!",
      "eventId": "uuid-da-atividade",
      "eventType": "activity",
      "scheduledFor": "2024-12-15T09:30:00.000Z",
      "status": "delivered",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /users/:uuid/notifications/unread

**Autenticação:** Requer self

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificações não lidas encontradas",
  "data": [
    {
      "uuid": "uuid-da-notificacao",
      "userId": "uuid-do-usuario",
      "message": "A atividade 'Palestra sobre Agricultura' começará em 30 minutos!",
      "eventId": "uuid-da-atividade",
      "eventType": "activity",
      "scheduledFor": "2024-12-15T09:30:00.000Z",
      "status": "delivered",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PATCH /users/:uuid/notifications/:notificationId/read

**Autenticação:** Requer self

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificação marcada como lida"
}
```

### PATCH /users/:uuid/notifications/read-all

**Autenticação:** Requer self

**Resposta (200):**

```json
{
  "success": true,
  "message": "Todas as notificações foram marcadas como lidas",
  "data": {
    "markedCount": 5
  }
}
```

### DELETE /users/:uuid/notifications/:notificationId

**Autenticação:** Requer self

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificação removida"
}
```

### DELETE /users/:uuid/notifications

**Autenticação:** Requer self

**Resposta (200):**

```json
{
  "success": true,
  "message": "Todas as notificações foram removidas"
}
```

## 🎯 Rotas de Atividades

### GET /activities

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Atividades encontradas",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-da-atividade",
      "name": "Palestra sobre Agricultura",
      "description": "Palestra sobre técnicas modernas de agricultura",
      "categoryId": "uuid-categoria",
      "imageUrls": [
        "https://s3.amazonaws.com/bucket/activities/uuid/imagem.jpg"
      ],
      "companyId": "uuid-empresa",
      "date": "15/12/2024",
      "startTime": "14:00",
      "endTime": "16:00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /activities/uuid/:uuid

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Atividade encontrada",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-da-atividade",
    "name": "Palestra sobre Agricultura",
    "description": "Palestra sobre técnicas modernas de agricultura",
    "categoryId": "uuid-categoria",
    "imageUrls": ["https://s3.amazonaws.com/bucket/activities/uuid/imagem.jpg"],
    "date": "15/12/2024",
    "startTime": "14:00",
    "endTime": "16:00",
    "company": {
      "uuid": "uuid-empresa",
      "name": "Empresa Agropecuária Ltda",
      "description": "Empresa especializada em soluções agropecuárias"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Nota:** Esta rota retorna os dados completos da empresa associada à atividade, incluindo nome e descrição, ao invés de apenas o ID da empresa.

### GET /activities/category/:categoryId

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Atividades encontradas",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-da-atividade",
      "name": "Palestra sobre Agricultura",
      "categoryId": "uuid-categoria"
    }
  ]
}
```

### GET /activities/name?name=palestra

**Autenticação:** Não requerida

**Query Parameters:**

- `name` (obrigatório): Nome ou descrição para buscar

**Resposta (200):**

```json
{
  "success": true,
  "message": "Atividades encontradas",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-da-atividade",
      "name": "Palestra sobre Agricultura"
    }
  ]
}
```

### GET /activities/date/:date

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Atividades encontradas",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-da-atividade",
      "name": "Palestra sobre Agricultura",
      "date": "15/12/2024"
    }
  ]
}
```

### GET /activities/interest?interest=agricultura

**Autenticação:** Não requerida

**Query Parameters:**

- `interest` (obrigatório): Termo de interesse para buscar

**Resposta (200):**

```json
{
  "success": true,
  "message": "Atividades encontradas",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-da-atividade",
      "name": "Palestra sobre Agricultura"
    }
  ]
}
```

### POST /activities

**Autenticação:** Requer admin  
**Schema:** `CreateActivityRequestSchema` (multipart/form-data)

**Body (multipart/form-data):**

```
name: "Palestra sobre Agricultura"
description: "Palestra sobre técnicas modernas de agricultura"
categoryId: "uuid-categoria"
companyId: "uuid-empresa"
date: "15/12/2024"
startTime: "14:00"
endTime: "16:00"
images: [arquivo1.jpg, arquivo2.jpg] (opcional)
```

**Resposta (201):**

```json
{
  "success": true,
  "message": "Atividade criada com sucesso",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-da-atividade",
    "name": "Palestra sobre Agricultura",
    "imageUrls": ["https://s3.amazonaws.com/bucket/activities/uuid/imagem.jpg"]
  }
}
```

### PUT /activities/:uuid

**Autenticação:** Requer admin  
**Schema:** `UpdateActivitySchema` (multipart/form-data)

**Body (multipart/form-data):**

```
name: "Palestra Atualizada"
description: "Descrição atualizada"
categoryId: "uuid-categoria"
companyId: "uuid-empresa"
date: "15/12/2024"
startTime: "14:00"
endTime: "16:00"
images: [arquivo1.jpg, arquivo2.jpg] (opcional)
```

**Resposta (200):**

```json
{
  "success": true,
  "message": "Atividade atualizada com sucesso",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-da-atividade",
    "name": "Palestra Atualizada"
  }
}
```

### DELETE /activities/:uuid

**Autenticação:** Requer admin

**Resposta (200):**

```json
{
  "success": true,
  "message": "Atividade deletada com sucesso"
}
```

### PATCH /activities/:uuid/images

**Autenticação:** Requer admin

**Body (multipart/form-data):**

```
imageIds: ["uuid-imagem-1", "uuid-imagem-2"]
images: [arquivo1.jpg, arquivo2.jpg] (opcional)
```

**Resposta (200):**

```json
{
  "success": true,
  "message": "Imagens da atividade atualizadas com sucesso",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-da-atividade",
    "imageUrls": ["https://s3.amazonaws.com/bucket/activities/uuid/imagem.jpg"]
  }
}
```

## 🏢 Rotas de Stands

### GET /stands

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Stands encontrados",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-do-stand",
      "name": "Stand da Empresa XYZ",
      "description": "Apresentação de produtos agrícolas",
      "categoryId": "uuid-categoria",
      "imageUrls": ["https://s3.amazonaws.com/bucket/stands/uuid/imagem.jpg"],
      "companyId": "uuid-empresa",
      "date": "15/12/2024",
      "openingTime": "09:00",
      "closingTime": "18:00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /stands/category/:category

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Stands encontrados por categoria",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-do-stand",
      "name": "Stand da Empresa XYZ",
      "categoryId": "uuid-categoria"
    }
  ]
}
```

### GET /stands/name/:name

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Stand encontrado",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-do-stand",
    "name": "Stand da Empresa XYZ"
  }
}
```

### GET /stands/uuid/:uuid

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Stand encontrado",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-do-stand",
    "name": "Stand da Empresa XYZ",
    "description": "Apresentação de produtos agrícolas",
    "categoryId": "uuid-categoria",
    "imageUrls": ["https://s3.amazonaws.com/bucket/stands/uuid/imagem.jpg"],
    "companyId": "uuid-empresa",
    "date": "15/12/2024",
    "openingTime": "09:00",
    "closingTime": "18:00"
  }
}
```

### GET /stands/date/:date

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Stands encontrados por data",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-do-stand",
      "name": "Stand da Empresa XYZ",
      "date": "15/12/2024"
    }
  ]
}
```

### GET /stands/interest/:interest

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Stands encontrados por interesse",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-do-stand",
      "name": "Stand da Empresa XYZ"
    }
  ]
}
```

### POST /stands

**Autenticação:** Requer admin  
**Schema:** `CreateStandRequestSchema` (multipart/form-data)

**Body (multipart/form-data):**

```
name: "Stand da Empresa XYZ"
description: "Apresentação de produtos agrícolas"
categoryId: "uuid-categoria"
companyId: "uuid-empresa"
date: "15/12/2024"
openingTime: "09:00"
closingTime: "18:00"
images: [arquivo1.jpg, arquivo2.jpg] (opcional)
```

**Resposta (201):**

```json
{
  "success": true,
  "message": "Stand criado com sucesso",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-do-stand",
    "name": "Stand da Empresa XYZ",
    "imageUrls": ["https://s3.amazonaws.com/bucket/stands/uuid/imagem.jpg"]
  }
}
```

### PUT /stands/:uuid

**Autenticação:** Requer admin  
**Schema:** `UpdateStandSchema` (multipart/form-data)

**Body (multipart/form-data):**

```
name: "Stand Atualizado"
description: "Descrição atualizada"
categoryId: "uuid-categoria"
companyId: "uuid-empresa"
date: "15/12/2024"
openingTime: "09:00"
closingTime: "18:00"
images: [arquivo1.jpg, arquivo2.jpg] (opcional)
```

**Resposta (200):**

```json
{
  "success": true,
  "message": "Stand atualizado com sucesso",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-do-stand",
    "name": "Stand Atualizado"
  }
}
```

### DELETE /stands/:uuid

**Autenticação:** Requer admin

**Resposta (200):**

```json
{
  "success": true,
  "message": "Stand deletado com sucesso"
}
```

### PATCH /stands/:uuid/images

**Autenticação:** Requer admin

**Body (multipart/form-data):**

```
imageIds: ["uuid-imagem-1", "uuid-imagem-2"]
images: [arquivo1.jpg, arquivo2.jpg] (opcional)
```

**Resposta (200):**

```json
{
  "success": true,
  "message": "Imagens do stand atualizadas com sucesso",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-do-stand",
    "imageUrls": ["https://s3.amazonaws.com/bucket/stands/uuid/imagem.jpg"]
  }
}
```

## 📂 Rotas de Categorias

### POST /categories

**Autenticação:** Requer admin  
**Schema:** `CreateCategorySchema`

**Body:**

```json
{
  "name": "Agricultura"
}
```

**Resposta (201):**

```json
{
  "id": "mongo_id",
  "uuid": "uuid-da-categoria",
  "name": "Agricultura"
}
```

### GET /categories

**Autenticação:** Não requerida

**Resposta (200):**

```json
[
  {
    "uuid": "uuid-da-categoria",
    "name": "Agricultura"
  },
  {
    "uuid": "uuid-da-categoria-2",
    "name": "Pecuária"
  }
]
```

### PUT /categories/:uuid

**Autenticação:** Requer admin

**Body:**

```json
{
  "name": "Agricultura Atualizada"
}
```

**Resposta (200):**

```json
{
  "uuid": "uuid-da-categoria",
  "name": "Agricultura Atualizada"
}
```

### DELETE /categories/:uuid

**Autenticação:** Requer admin

**Resposta (200):**

```json
{
  "success": true
}
```

## 🏭 Rotas de Empresas

### POST /companies

**Autenticação:** Requer admin  
**Schema:** `CreateCompanySchema`

**Body:**

```json
{
  "name": "Empresa XYZ",
  "description": "Empresa especializada em produtos agrícolas"
}
```

**Resposta (201):**

```json
{
  "id": "mongo_id",
  "uuid": "uuid-da-empresa",
  "name": "Empresa XYZ",
  "description": "Empresa especializada em produtos agrícolas"
}
```

### GET /companies

**Autenticação:** Não requerida

**Resposta (200):**

```json
[
  {
    "uuid": "uuid-da-empresa",
    "name": "Empresa XYZ",
    "description": "Empresa especializada em produtos agrícolas"
  }
]
```

### PUT /companies/:uuid

**Autenticação:** Requer admin  
**Schema:** `UpdateCompanySchema`

**Body:**

```json
{
  "name": "Empresa XYZ Atualizada",
  "description": "Descrição atualizada"
}
```

**Resposta (200):**

```json
{
  "uuid": "uuid-da-empresa",
  "name": "Empresa XYZ Atualizada",
  "description": "Descrição atualizada",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /companies/:uuid

**Autenticação:** Requer admin

**Resposta (200):**

```json
{
  "success": true
}
```

## 🔔 Rotas de Notificações

### POST /notifications

**Autenticação:** Requer admin  
**Schema:** `CreateNotificationSchema`

**Body:**

```json
{
  "title": "Anúncio Importante",
  "message": "Evento será realizado amanhã",
  "type": "announcement",
  "isScheduled": false,
  "status": "pending",
  "date": "15/12/2024",
  "time": "10:00",
  "expiresAt": "2024-12-16T10:00:00.000Z",
  "targetAudience": ["all"]
}
```

**Tipos de notificação:**

- `announcement`: Anúncio
- `alert`: Alerta
- `system`: Sistema
- `event`: Evento

**Status:**

- `pending`: Pendente
- `delivered`: Entregue
- `read`: Lida

**Audiência:**

- `all`: Todos
- `admin`: Administradores
- `exhibitors`: Expositores
- `visitors`: Visitantes
- `staff`: Funcionários

**Resposta (201):**

```json
{
  "success": true,
  "message": "Notificação criada com sucesso",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-da-notificacao",
    "title": "Anúncio Importante",
    "message": "Evento será realizado amanhã",
    "type": "announcement",
    "isScheduled": false,
    "status": "pending",
    "date": "15/12/2024",
    "time": "10:00",
    "targetAudience": ["all"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /notifications

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificações encontradas",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-da-notificacao",
      "title": "Anúncio Importante",
      "message": "Evento será realizado amanhã",
      "type": "announcement",
      "isScheduled": false,
      "status": "pending",
      "date": "15/12/2024",
      "time": "10:00",
      "targetAudience": ["all"]
    }
  ]
}
```

### GET /notifications/delivered

**Autenticação:** Não requerida

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificações entregues encontradas",
  "data": [
    {
      "_id": "mongo_id",
      "uuid": "uuid-da-notificacao",
      "title": "Anúncio Importante",
      "message": "Evento será realizado amanhã",
      "type": "announcement",
      "isScheduled": false,
      "status": "delivered",
      "date": "15/12/2024",
      "time": "10:00",
      "targetAudience": ["all"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /notifications/:uuid

**Autenticação:** Requer admin  
**Schema:** `UpdateNotificationSchema`

**Body:**

```json
{
  "title": "Anúncio Atualizado",
  "message": "Mensagem atualizada",
  "type": "announcement",
  "isScheduled": true,
  "status": "pending",
  "date": "15/12/2024",
  "time": "10:00",
  "expiresAt": "2024-12-16T10:00:00.000Z",
  "targetAudience": ["all"]
}
```

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificação atualizada com sucesso",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-da-notificacao",
    "title": "Anúncio Atualizado",
    "message": "Mensagem atualizada"
  }
}
```

### DELETE /notifications/:uuid

**Autenticação:** Requer admin

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificação deletada com sucesso"
}
```

### GET /notifications/scheduled

**Autenticação:** Requer autenticação

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificações agendadas encontradas",
  "data": [
    {
      "userId": "uuid-do-usuario",
      "eventId": "uuid-do-evento",
      "type": "30min",
      "nextInvocation": "2024-12-15T09:30:00.000Z",
      "userName": "Nome Sobrenome",
      "eventName": "Palestra sobre Agricultura",
      "eventType": "activity",
      "notificationType": "30 minutos antes"
    }
  ]
}
```

### POST /notifications/:uuid/reschedule

**Autenticação:** Requer admin

**Resposta (200):**

```json
{
  "success": true,
  "message": "Notificação reagendada com sucesso",
  "data": {
    "_id": "mongo_id",
    "uuid": "uuid-da-notificacao",
    "title": "Anúncio Importante",
    "message": "Evento será realizado amanhã",
    "type": "announcement",
    "isScheduled": true,
    "status": "pending",
    "date": "15/12/2024",
    "time": "10:00",
    "targetAudience": ["all"]
  }
}
```

**Nota:** Esta rota permite reagendar manualmente uma notificação que já foi criada, útil para casos onde a data/hora do evento foi alterada.

## 🗓️ Rotas de Programação

### GET /schedule

**Autenticação:** Não requerida  
**Schema de resposta:** Array de `ScheduleItemSchema`

**Resposta (200):**

```json
[
  {
    "type": "activity",
    "uuid": "uuid-da-atividade",
    "name": "Palestra sobre Agricultura",
    "description": "Palestra sobre técnicas modernas de agricultura",
    "date": "15/12/2024",
    "startTime": "14:00",
    "endTime": "16:00",
    "categoryId": "uuid-categoria",
    "companyId": "uuid-empresa",
    "imageUrls": ["https://s3.amazonaws.com/bucket/activities/uuid/imagem.jpg"]
  },
  {
    "type": "stand",
    "uuid": "uuid-do-stand",
    "name": "Stand da Empresa XYZ",
    "description": "Apresentação de produtos agrícolas",
    "date": "15/12/2024",
    "openingTime": "09:00",
    "closingTime": "18:00",
    "categoryId": "uuid-categoria",
    "companyId": "uuid-empresa",
    "imageUrls": ["https://s3.amazonaws.com/bucket/stands/uuid/imagem.jpg"]
  }
]
```

**Nota:** Esta rota retorna todas as atividades e stands ordenados por data e hora.

### GET /schedule/user/:uuid

**Autenticação:** Requer self ou admin  
**Schema de resposta:** Array de `ScheduleItemSchema`

**Resposta (200):**

```json
{
  "success": true,
  "message": "Programação do usuário encontrada com sucesso",
  "data": [
    {
      "type": "activity",
      "uuid": "uuid-da-atividade",
      "name": "Palestra sobre Agricultura",
      "description": "Palestra sobre técnicas modernas de agricultura",
      "date": "15/12/2024",
      "startTime": "14:00",
      "endTime": "16:00",
      "categoryId": "uuid-categoria",
      "companyId": "uuid-empresa",
      "imageUrls": [
        "https://s3.amazonaws.com/bucket/activities/uuid/imagem.jpg"
      ]
    },
    {
      "type": "stand",
      "uuid": "uuid-do-stand",
      "name": "Stand da Empresa XYZ",
      "description": "Apresentação de produtos agrícolas",
      "date": "15/12/2024",
      "openingTime": "09:00",
      "closingTime": "18:00",
      "categoryId": "uuid-categoria",
      "companyId": "uuid-empresa",
      "imageUrls": ["https://s3.amazonaws.com/bucket/stands/uuid/imagem.jpg"]
    }
  ]
}
```

**Nota:** Esta rota retorna apenas as atividades e stands que o usuário marcou interesse, ordenados por data e hora.

## 🌐 WebSocket

### Conexão WebSocket

```
ws://localhost:3000/ws?token=seu_jwt_token
```

**Parâmetros necessários:**

- `token`: JWT token obtido no login (obrigatório)

**Exemplo:**

```
ws://localhost:3000/ws?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Tipos de Mensagens

#### Conexão estabelecida

```json
{
  "type": "connected",
  "userId": "uuid-do-usuario"
}
```

#### Notificação de usuário

```json
{
  "uuid": "uuid-da-notificacao",
  "userId": "uuid-do-usuario",
  "message": "A atividade 'Palestra sobre Agricultura' começará em 30 minutos!",
  "eventId": "uuid-da-atividade",
  "eventType": "activity",
  "scheduledFor": "2024-12-15T09:30:00.000Z",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Notificação global

```json
{
  "uuid": "uuid-da-notificacao",
  "title": "Anúncio Importante",
  "message": "Evento será realizado amanhã",
  "type": "announcement",
  "isScheduled": false,
  "status": "pending",
  "date": "15/12/2024",
  "time": "10:00",
  "targetAudience": ["all"]
}
```

## 📝 Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Requisição inválida
- **401**: Não autorizado
- **403**: Acesso negado
- **404**: Não encontrado
- **500**: Erro interno do servidor

## 🔧 Funcionalidades Especiais

### Upload de Imagens

- Suporte a múltiplas imagens
- Redimensionamento automático
- Upload para AWS S3
- Validação de tipos de arquivo
- Cache de hashes para evitar duplicatas

### Sistema de Notificações

- Notificações em tempo real via WebSocket
- Agendamento automático de notificações
- Notificações 30 minutos antes e no início de eventos
- Diferentes tipos de audiência
- Status de entrega e leitura
- **Prevenção de duplicatas**: Sistema evita notificações repetidas
- **Limpeza automática**: Notificações pendentes são removidas ao reagendar
- **Logs detalhados**: Rastreamento completo do ciclo de vida das notificações
- **Reconexão inteligente**: WebSocket com autenticação JWT via query parameter

### Autenticação e Autorização

- JWT para autenticação
- Diferentes níveis de acesso
- Middleware de autorização configurável
- Validação de permissões por recurso

### Validação de Dados

- Validação com Zod
- Mensagens de erro em português
- Validação de tipos de dados
- Sanitização de entrada

### Tratamento de Erros

A API possui um sistema robusto de tratamento de erros:

- **Validação de Schema**: Erros de validação Zod são formatados automaticamente
- **Body Vazio**: Requisições com body vazio são tratadas adequadamente
- **Serialização**: Erros de serialização de resposta são capturados
- **Logs Detalhados**: Todos os erros são logados com contexto completo

### Logs e Monitoramento

- Logs estruturados com Pino
- Formatação legível em desenvolvimento
- Nível de log configurável
- Timestamps em formato legível
- Logs de erro detalhados para debugging

## 🚀 Deploy

### Docker

```bash
# Construir imagem
docker build -t agropec-api .

# Executar container
docker run -p 3000:3000 agropec-api
```

### Docker Compose

```bash
# Executar com MongoDB
docker-compose up -d
```

O `docker-compose.yml` inclui:

- **MongoDB**: Banco de dados principal
- **Volumes**: Persistência de dados
- **Portas**: MongoDB na porta 27017
- **Restart**: Configuração automática de restart

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
