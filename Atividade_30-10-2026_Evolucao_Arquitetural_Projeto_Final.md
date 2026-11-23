# ATIVIDADE PRÁTICA — EVOLUÇÃO ARQUITETURAL DO PROJETO FINAL

**Disciplina:** Programação para Sistemas Web  
**Aula de referência:** 30/10/2026  
**Tecnologias trabalhadas:** React, Node.js, Fastify e MySQL  
**Modalidade:** em grupo, mantendo os grupos do projeto já desenvolvido  
**Entrega:** publicação no Canvas no prazo informado pelo professor  
**Natureza:** etapa evolutiva do projeto que será utilizado na entrega final da disciplina

> **Atenção:** não é permitido abandonar o projeto atual para entregar outro projeto simplificado. O objetivo é evoluir e reorganizar o sistema que o grupo já desenvolveu.

## 1. Objetivo

Aplicar conceitos de **arquitetura de software e organização de projetos Web** na aplicação do grupo, separando responsabilidades e preparando o código para crescer. A estruturação arquitetural é o foco principal da atividade. Para demonstrar que a arquitetura funciona, o grupo também deverá incorporar **validação de entradas**, **consulta com busca e paginação no MySQL** e **consumo dessas funcionalidades no React**.

## 2. Parte principal — arquitetura e refatoração

### 2.1. Escolha arquitetural

Cada grupo deverá selecionar uma abordagem de organização para o backend, justificando-a conforme o porte e as necessidades da aplicação. São aceitos, entre outros:

- **MVC adaptado a uma API REST:** rotas, controllers, models e apresentação no React. O backend não precisa ter templates ou uma pasta `views` artificial; a apresentação é feita pelo frontend.
- **Arquitetura em camadas:** rotas/controllers, services e repositories, com responsabilidades separadas.
- **Organização por funcionalidades (feature-based):** módulos como `users/`, `products/` ou `tasks/`, contendo as partes necessárias para cada funcionalidade; pode combinar camadas dentro de cada módulo.

**Não existe um modelo único obrigatório.** A escolha será considerada válida quando a estrutura fizer sentido, estiver implementada e tiver responsabilidades demonstráveis. Criar pastas vazias ou apenas renomear arquivos não atende ao objetivo.

### 2.2. Requisitos mínimos de separação no backend

Aplicar a arquitetura escolhida ao **CRUD completo de uma entidade central** do projeto, observando estas responsabilidades:

| Responsabilidade | O que deve conter | Exemplos de arquivos (nomes livres) |
|---|---|---|
| Entrada HTTP | Definição das rotas, parâmetros, schemas e resposta HTTP | `routes/`, `*.routes.ts`, `*.controller.ts` |
| Regras e operações da aplicação | Coordenação do que acontece em cada operação, regras e decisões de negócio | `services/`, `*.service.ts` |
| Acesso aos dados | Consultas SQL parametrizadas e operações de persistência | `models/`, `repositories/`, `*.repository.ts` |
| Infraestrutura | Configuração do Pool e variáveis de ambiente | `database/connection.ts`, `.env.example` |

As responsabilidades podem ser agrupadas de maneira coerente, mas **não podem permanecer todas misturadas em um único arquivo**. O `server.ts` deve ficar concentrado na criação/configuração do servidor e no registro de rotas/plugins.

**Exemplo de arquitetura em camadas (referência, não obrigatória):**

```text
backend/
├── src/
│   ├── database/
│   │   └── connection.ts
│   ├── routes/
│   │   └── users.routes.ts
│   ├── controllers/
│   │   └── users.controller.ts
│   ├── services/
│   │   └── users.service.ts
│   ├── repositories/
│   │   └── users.repository.ts
│   ├── schemas/
│   │   └── users.schema.ts
│   └── server.ts
├── .env.example
└── package.json
```

**Exemplo de organização por funcionalidades (referência, não obrigatória):**

```text
backend/src/
├── modules/
│   └── users/
│       ├── users.routes.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.repository.ts
│       └── users.schema.ts
├── database/
│   └── connection.ts
└── server.ts
```

### 2.3. Organização do React

Organizar a parte da interface relacionada à entidade escolhida, separando **tela**, **componentes reutilizáveis** e **consumo da API**. Os grupos podem optar por pastas gerais (`pages/`, `components/`, `services/`, `hooks/`, `types/`) ou por módulos (`features/users/`, `features/products/` etc.).

No mínimo, a tela de listagem **não deve concentrar todas as chamadas HTTP e todos os componentes de interface em um bloco monolítico**. O acesso à API deve estar organizado em um serviço ou módulo próprio.

### 2.4. Preservação do projeto

- O grupo deve preservar as funcionalidades já implementadas.
- O CRUD da entidade central deve continuar funcionando após a refatoração.
- Não duplicar endpoints para compensar a mudança de arquitetura.
- Manter a persistência existente em MySQL quando aplicável ao recurso.
- Não é necessário refatorar todas as funcionalidades secundárias de uma vez; a **entidade central deve estar completa e consistente** e a estrutura escolhida deve ser replicável no restante do projeto.

## 3. Evolução funcional obrigatória

A organização não deve ser apenas visual. Aplique os requisitos abaixo na **mesma entidade** usada para a refatoração.

### 3.1. Validação de entradas com Fastify

Implementar **JSON Schemas** para, no mínimo:

1. **Cadastro ou edição:** validar o corpo (`body`) do `POST` ou `PUT`, com campos obrigatórios, tipos e limites coerentes com a entidade.
2. **Busca e paginação:** validar a `querystring`, aceitando `page`, `limit` e `search`.

Condições mínimas para paginação:

- `page`: inteiro a partir de 1, padrão 1.
- `limit`: inteiro entre 1 e 50, padrão 10.
- `search`: texto opcional, com limite máximo razoável (sugestão: 100 caracteres).
- Entradas inválidas devem produzir resposta apropriada, preferencialmente `400 Bad Request` pela validação do Fastify.

**Exemplo de schema para querystring:**

```ts
export const paginationSchema = {
  querystring: {
    type: "object",
    properties: {
      page: { type: "integer", minimum: 1, default: 1 },
      limit: { type: "integer", minimum: 1, maximum: 50, default: 10 },
      search: { type: "string", maxLength: 100, default: "" },
    },
    additionalProperties: false,
  },
} as const;
```

### 3.2. Busca e paginação no backend

Criar um endpoint adicional que liste os registros de maneira paginada e filtrada. Exemplo, para uma aplicação que possui usuários:

```http
GET /users/paginated?page=1&limit=10&search=ana
```

Substitua `users` pelo recurso central do projeto: `products`, `tasks`, `events` etc.

**Requisitos:**

- Buscar registros no **MySQL**, não apenas filtrar um array carregado inteiro no Node.js.
- Implementar `LIMIT` e `OFFSET`; calcular `offset = (page - 1) * limit`.
- Aplicar filtro por pelo menos **um campo relevante** (ex.: nome, título, descrição, e-mail).
- Usar consultas parametrizadas com `?` para valores, evitando concatenação de entradas do usuário no SQL.
- Calcular o **total de registros filtrados**, necessário para o total de páginas.
- Ordenar o resultado por critério definido (`ORDER BY`) para garantir paginação previsível.
- Preservar o endpoint antigo da listagem caso sua resposta original seja usada por outras telas.

**Modelo de SQL (ajustar aos nomes reais da tabela e das colunas):**

```sql
SELECT id, name, email
FROM users
WHERE name LIKE ? OR email LIKE ?
ORDER BY id
LIMIT ? OFFSET ?;
```

O filtro deve ser passado como valor, por exemplo `%ana%`, e não inserido diretamente na string SQL. A consulta de contagem (`COUNT(*)`) deve seguir o **mesmo filtro**.

**Contrato de resposta esperado:**

```json
{
  "data": [
    { "id": 1, "name": "Ana", "email": "ana@email.com" }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

Os dados são ilustrativos; o formato deve ser mantido, com campos adaptados à entidade do grupo.

### 3.3. Integração no frontend React

Na página de listagem da entidade escolhida, acrescentar:

- Um campo de pesquisa que envie o valor `search` para a API.
- Controles de navegação entre páginas: **Anterior/Próxima** ou números.
- Indicação da página atual e do total de páginas.
- Requisições à nova rota a partir da interface, incluindo `page`, `limit` e `search`.
- Tratamento visual de **carregamento**, **erro** e **lista vazia**.

Não é necessário redesenhar toda a aplicação. O foco é conectar uma tela existente ao novo fluxo estruturado.

## 4. Evidências e documentação

Atualizar o `README.md` do projeto contendo:

1. Nome do projeto e integrantes do grupo.
2. **Arquitetura escolhida e justificativa**: por que o grupo adotou MVC adaptado, camadas, features ou outra abordagem coerente.
3. **Árvore de pastas** explicando a responsabilidade dos principais diretórios do backend e frontend.
4. **Fluxo real de uma requisição**, por exemplo: clique na tela → serviço de API → rota → controller → service → repository/model → MySQL → resposta JSON.
5. Instruções para executar frontend e backend e configurar o banco (`.env.example`, comando de setup/migration caso utilizado).
6. Endpoint da paginação e dois exemplos de chamadas com diferentes filtros/páginas.

**Não publicar senhas, tokens ou o `.env` real.** Incluir apenas um `.env.example` sem credenciais pessoais.

### O que publicar no Canvas

- Um arquivo `.zip` com o **projeto atualizado**, contendo frontend e backend, sem `node_modules` e sem `.env` real.
- O arquivo `README.md` deve estar dentro do projeto.
- Os arquivos necessários para criar ou atualizar a estrutura do banco (scripts de setup ou migrations, caso existam no projeto).
- Preferencialmente, um breve registro dos testes (capturas de tela do React e do DevTools/Network ou descrição dos testes no README).

Se o professor definir outro formato de entrega no Canvas, seguir essa orientação mantendo os mesmos conteúdos.

## 5. Demonstração esperada

Na verificação, o grupo deverá ser capaz de:

1. **Abrir a estrutura de pastas** e justificar a divisão escolhida.
2. Apontar onde uma nova rota, uma regra de negócio, uma consulta SQL e um componente React devem ser escritos.
3. Demonstrar **um CRUD completo** da entidade refatorada.
4. Pesquisar um registro e navegar por páginas pelo React.
5. Exibir o endpoint paginado e seus metadados no DevTools ou em cliente HTTP.
6. Demonstrar uma validação rejeitando entrada inválida.
7. Confirmar que os registros permanecem no MySQL.

## 6. Critérios de avaliação/verificação

**A prioridade desta atividade é a arquitetura.** Os critérios serão observados nesta ordem:

| Prioridade | Critério | O que será observado |
|---|---|---|
| **Principal** | Organização arquitetural | Coerência da estrutura, separação real de responsabilidades, justificativa e aplicação no código |
| Alta | Preservação do projeto | O CRUD e as funcionalidades anteriores continuam operacionais |
| Média | Validação | Schemas Fastify corretos e retornos apropriados para entradas inválidas |
| Média | Busca e paginação | Filtro e paginação no banco; dados e metadados consistentes |
| Média | Integração React | Pesquisa, navegação, carregamento e erros na tela |
| Complementar | Documentação | README completo, projeto executável e fluxo arquitetural explicado |

**Não basta criar diretórios com nomes bonitos:** se SQL continuar no controller junto com regras de negócio, ou se a separação for apenas nominal, a parte principal não estará atendida.

*Esta proposta não fixa pontuação nem data de entrega específica: o professor definirá esses detalhes na atividade publicada no Canvas.*

## 7. Roteiro sugerido durante a aula

| Momento | Foco | Resultado mínimo |
|---|---|---|
| 1º tempo | Diagnóstico, MVC, camadas, features e decisão arquitetural | Estrutura escolhida e justificativa inicial |
| 2º tempo | Refatoração de backend e frontend | CRUD da entidade central separado por responsabilidades |
| 3º tempo | Schemas, consulta filtrada e paginação | Endpoint paginado com dados do MySQL |
| 4º tempo | Interface React, testes e documentação | Fluxo integrado e README atualizado |

A atividade pode ser iniciada na aula e concluída até o prazo estabelecido no Canvas. O mesmo projeto continuará sendo evoluído para a entrega final da disciplina.

## 8. Checklist de conclusão

- [ ] O projeto anterior foi preservado e continua funcional.
- [ ] A arquitetura escolhida foi aplicada e justificada.
- [ ] O backend da entidade central separa entrada HTTP, regras e persistência.
- [ ] O frontend organiza páginas, componentes e comunicação com a API.
- [ ] O CRUD completo da entidade central funciona após a refatoração.
- [ ] Há schema para `body` de POST/PUT e para `querystring` da listagem paginada.
- [ ] A listagem consulta o banco com `LIMIT`, `OFFSET`, filtros e contagem total.
- [ ] A interface React permite buscar e trocar de página.
- [ ] O README explica estrutura, fluxo e execução.
- [ ] A entrega não inclui `node_modules` nem senhas reais.

---

**Referências de apoio**

- Fastify — Plugins: https://fastify.dev/docs/latest/Reference/Plugins/
- Fastify — Validation and Serialization: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/
- MySQL — SELECT / LIMIT: https://dev.mysql.com/doc/refman/8.4/en/select.html
- mysql2 — Promises: https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper
- React — File Structure: https://legacy.reactjs.org/docs/faq-structure.html
