# Entidade Highlights

A entidade `highlights` foi criada para gerenciar destaques de atividades, stands e empresas no sistema Agropec.

## Estrutura

### Interface (`src/interfaces/highlight.ts`)
- **uuid**: Identificador único do destaque
- **title**: Título do destaque
- **description**: Descrição do destaque
- **type**: Tipo do destaque (`activity`, `stand`, `company`)
- **referenceId**: ID da entidade referenciada (atividade, stand ou empresa)
- **priority**: Prioridade do destaque (1-10)
- **isActive**: Status ativo/inativo do destaque
- **startDate**: Data de início (opcional)
- **endDate**: Data de fim (opcional)
- **imageUrl**: URL da imagem do destaque (opcional)

### Repositório (`src/repositories/HighlightRepository.ts`)
Métodos disponíveis:
- `getAll()`: Buscar todos os destaques
- `getActive()`: Buscar apenas destaques ativos
- `getByUuid(uuid)`: Buscar por UUID
- `getByType(type)`: Buscar por tipo
- `getByReferenceId(referenceId)`: Buscar por ID de referência
- `getByPriority(priority)`: Buscar por prioridade
- `create(highlight, uuid?)`: Criar novo destaque
- `update(uuid, data)`: Atualizar destaque
- `delete(uuid)`: Deletar destaque

### Use Cases (`src/useCases/highlights/`)
- `createHighlight.ts`: Criar destaque
- `getAllHighlights.ts`: Buscar todos os destaques
- `getActiveHighlights.ts`: Buscar destaques ativos
- `getHighlightByUuid.ts`: Buscar por UUID
- `getHighlightsByType.ts`: Buscar por tipo
- `updateHighlight.ts`: Atualizar destaque
- `deleteHighlight.ts`: Deletar destaque
- `getHighlightsWithDetails.ts`: Buscar destaques com detalhes das entidades relacionadas

### Controller (`src/controllers/HighlightController.ts`)
Endpoints disponíveis:
- `GET /highlights`: Listar todos os destaques
- `GET /highlights/active`: Listar destaques ativos
- `GET /highlights/uuid/:uuid`: Buscar por UUID
- `GET /highlights/type/:type`: Buscar por tipo
- `GET /highlights/with-details`: Buscar com detalhes das entidades
- `POST /highlights`: Criar destaque (requer autenticação de admin)
- `PUT /highlights/:uuid`: Atualizar destaque (requer autenticação de admin)
- `DELETE /highlights/:uuid`: Deletar destaque (requer autenticação de admin)
- `PATCH /highlights/:uuid/image`: Atualizar imagem (requer autenticação de admin)

## Funcionalidades

### 1. Gestão de Destaques
- Criação de destaques para atividades, stands e empresas
- Controle de prioridade para ordenação
- Status ativo/inativo
- Período de exibição (datas de início e fim)

### 2. Relacionamentos
- Referência a atividades através do `referenceId`
- Referência a stands através do `referenceId`
- Referência a empresas através do `referenceId`

### 3. Upload de Imagens
- Suporte a upload de imagens para destaques
- Integração com S3 para armazenamento
- Processamento e otimização de imagens

### 4. Segurança
- Autenticação JWT obrigatória para operações de escrita
- Autorização de admin para criação, edição e exclusão
- Validação de schemas com Zod

## Exemplo de Uso

### Criar um destaque para uma atividade:
```json
{
  "title": "Atividade em Destaque",
  "description": "Uma atividade muito importante",
  "type": "activity",
  "referenceId": "uuid-da-atividade",
  "priority": 5,
  "isActive": true,
  "startDate": "01/01/2024",
  "endDate": "31/12/2024"
}
```

### Buscar destaques com detalhes:
```bash
GET /highlights/with-details
```

Resposta incluirá os dados completos das entidades relacionadas:
```json
{
  "success": true,
  "message": "Destaques com detalhes encontrados",
  "data": [
    {
      "uuid": "highlight-uuid",
      "title": "Atividade em Destaque",
      "type": "activity",
      "referenceId": "activity-uuid",
      "priority": 5,
      "isActive": true,
      "activity": {
        "uuid": "activity-uuid",
        "name": "Nome da Atividade",
        "description": "Descrição da atividade",
        // ... outros campos da atividade
      }
    }
  ]
}
```

## Integração

A entidade highlights está totalmente integrada ao sistema:
- ✅ Plugin de repositórios
- ✅ Plugin de validação
- ✅ Plugin de autorização
- ✅ Plugin de upload de imagens
- ✅ Tipagem TypeScript
- ✅ Rotas registradas
- ✅ Tratamento de erros
- ✅ Logs e monitoramento 