# 🚀 API Agropec

API RESTful para gerenciamento de eventos agropecuários, desenvolvida com Fastify, TypeScript e MongoDB.

## 📋 Índice

- [Configuração](#configuração)
- [Autenticação](#autenticação)
- [Rotas de Administradores](#rotas-de-administradores)
- [Rotas de Usuários](#rotas-de-usuários)
- [Rotas de Atividades](#rotas-de-atividades)
- [Rotas de Stands](#rotas-de-stands)
- [Rotas de Categorias](#rotas-de-categorias)
- [Rotas de Empresas](#rotas-de-empresas)
- [Rotas de Notificações](#rotas-de-notificações)
- [WebSocket](#websocket)

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=agropec

# JWT
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=1d

# AWS S3
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu_bucket_name
```

### Instalação

```bash
# Instalar dependências
yarn install

# Criar primeiro administrador
yarn ts-node src/scripts/create-first-admin.ts

# Executar em desenvolvimento
yarn dev

# Executar em produção
yarn start
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

## 👨‍💼 Rotas de Administradores

### POST /admin/login

**Autenticação:** Não requerida

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

## 👤 Rotas de Usuários

### POST /users/login

**Autenticação:** Não requerida

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
    "role": "user"
  },
  "token": "jwt_token_aqui"
}
```

### POST /users/signup

**Autenticação:** Não requerida

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
    "role": "user"
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

**Body:**

```json
{
  "activitiesId": ["uuid-atividade-1"]
}
```

### PATCH /users/:uuid/stands/remove

**Autenticação:** Requer self

**Body:**

```json
{
  "standsId": ["uuid-stand-1"]
}
```

### PATCH /users/:uuid

**Autenticação:** Requer self

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
      "latitude": -23.5505,
      "longitude": -46.6333,
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
    "latitude": -23.5505,
    "longitude": -46.6333,
    "imageUrls": ["https://s3.amazonaws.com/bucket/activities/uuid/imagem.jpg"],
    "companyId": "uuid-empresa",
    "date": "15/12/2024",
    "startTime": "14:00",
    "endTime": "16:00"
  }
}
```

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

**Body (multipart/form-data):**

```
name: "Palestra sobre Agricultura"
description: "Palestra sobre técnicas modernas de agricultura"
categoryId: "uuid-categoria"
latitude: -23.5505
longitude: -46.6333
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

**Body (multipart/form-data):**

```
name: "Palestra Atualizada"
description: "Descrição atualizada"
categoryId: "uuid-categoria"
latitude: -23.5505
longitude: -46.6333
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
      "latitude": -23.5505,
      "longitude": -46.6333,
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
    "latitude": -23.5505,
    "longitude": -46.6333,
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

**Body (multipart/form-data):**

```
name: "Stand da Empresa XYZ"
description: "Apresentação de produtos agrícolas"
categoryId: "uuid-categoria"
latitude: -23.5505
longitude: -46.6333
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

**Body (multipart/form-data):**

```
name: "Stand Atualizado"
description: "Descrição atualizada"
categoryId: "uuid-categoria"
latitude: -23.5505
longitude: -46.6333
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

### PUT /notifications/:uuid

**Autenticação:** Requer admin

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

## 🌐 WebSocket

### Conexão WebSocket

```
ws://localhost:3000/ws
```

**Headers necessários:**

```
x-user-id: uuid-do-usuario
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

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
