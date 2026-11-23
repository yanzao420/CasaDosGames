## Casa dos Games

Catálogo de jogos em React + TypeScript. O frontend consome uma API Fastify, e os jogos ficam persistidos no MySQL. O login continua mockado, sem banco e sem JWT. Os favoritos continuam no `localStorage` do navegador.

Alunos: Matheus Soares, Pedro Cavalcanti Coquito, Yan mendonça.

## Arquitetura

O backend da entidade **jogo** usa **arquitetura em camadas**.

O Casa dos Games tem um recurso central, o catálogo, e o resto é apoio: health check, login de demonstração e favoritos locais. Camadas deixam explícito o caminho de uma requisição sem criar um módulo por feature que ainda não existe. MVC com pasta de views não cabe, porque a tela é o React. A mesma divisão (rota, controller, service, repository) pode ser copiada quando surgir outra entidade.

| Camada | Responsabilidade no projeto |
| --- | --- |
| Rota | URL, método e JSON Schema. Não acessa o banco. |
| Controller | Lê a requisição já validada e devolve o status HTTP. |
| Service | Regras do jogo: texto aparado, capa gerada quando não há imagem, `offset` da página e erro quando o id não existe. |
| Repository | SQL parametrizado (`?`), `LIMIT`/`OFFSET` e `COUNT`. |
| Database | Pool do `mysql2` e script da tabela. |

O `backend/server.ts` só sobe o Fastify, o CORS, o tratamento de erro e o registro das rotas. Antes de escutar a porta, ele garante que o banco e a tabela existam.

## Árvore de pastas

```text
backend/
├── server.ts                          # sobe o Fastify e registra os plugins
└── src/
    ├── database/
    │   ├── connection.ts              # pool MySQL
    │   ├── env.ts                     # lê host, porta, usuário, senha e database
    │   ├── prepare.ts                 # cria o banco e a tabela
    │   ├── schema.sql                 # script SQL para criar a estrutura
    │   ├── seed.ts                    # 12 jogos iniciais, só se a tabela estiver vazia
    │   └── setup.ts                   # comando npm run db:setup
    ├── routes/
    │   ├── games.routes.ts            # rotas HTTP de jogos + schemas
    │   └── health.routes.ts           # GET /health
    ├── controllers/
    │   └── games.controller.ts
    ├── services/
    │   └── games.service.ts
    ├── repositories/
    │   └── games.repository.ts
    ├── schemas/
    │   └── games.schema.ts
    ├── plugins/
    │   └── error-handler.ts           # 400 de validação e erros da aplicação
    └── utils/
        └── cover.ts                   # capa SVG quando o jogo não tem imagem

src/
├── pages/                             # telas: login, home, catálogo, formulário, detalhe, favoritos
├── components/
│   ├── GameCard/                      # card reutilizado na listagem
│   ├── Pagination/                    # anterior, próxima e página atual
│   ├── Feedback/                      # carregando, erro e lista vazia
│   └── NavBar/
├── hooks/
│   └── usePaginatedGames.ts           # estado da listagem paginada
├── services/
│   └── api.ts                         # todas as chamadas HTTP do frontend
├── types/
└── utils/                             # favoritos locais e a medição antiga de filtro
```

Login, favoritos e a medição de filtro continuam onde já estavam. A refatoração obrigatória ficou na entidade jogo.

## Fluxo de uma requisição

Busca no catálogo, por exemplo o texto `neon` na página 1:

1. A pessoa digita no campo da tela `ListaJogo`.
2. O hook `usePaginatedGames` chama `fetchPaginatedGames` em `src/services/api.ts`.
3. O navegador envia `GET /games/paginated?page=1&limit=10&search=neon&sort=title-asc`.
4. `games.routes.ts` valida a querystring com o JSON Schema do Fastify. `page=0` ou `limit=80` para aqui e responde `400`.
5. `games.controller.ts` entrega a query ao service.
6. `games.service.ts` calcula `offset = (page - 1) * limit` e pede os registros e o total.
7. `games.repository.ts` executa, no MySQL, o `SELECT` com `LIKE ?`, `ORDER BY`, `LIMIT ? OFFSET ?` e um `COUNT(*)` com o mesmo filtro. O texto da busca vai como parâmetro (`%neon%`), não concatenado no SQL.
8. A API responde `{ data, total, page, limit, totalPages }`.
9. O React mostra os cards, o total, "Página X de Y" e os botões Anterior/Próxima. Se a API falhar, a tela mostra o erro e o botão de tentar de novo. Se nada for encontrado, mostra a lista vazia.

O cadastro segue o mesmo caminho: o formulário chama `POST /games`, o schema valida o corpo, o service gera a capa se a imagem vier vazia, e o repository faz o `INSERT`.

## Pré-requisito

- Node.js 20 ou superior.
- MySQL 8 acessível em `localhost:3306`. No Windows, o serviço `MySQL80` precisa estar em execução.

## Configurar

Na pasta do projeto:

```bash
npm install
copy .env.example .env
```

Edite o `.env` se o usuário ou a senha do MySQL não forem `root` com senha vazia. Não commite o `.env`.

```bash
npm run db:setup
```

Esse comando cria o database `casa_dos_games`, a tabela `games` e, se a tabela estiver vazia, insere os 12 jogos iniciais. O servidor também faz esse preparo ao subir, para o catálogo não nascer vazio.

O script SQL manual está em `backend/src/database/schema.sql`.

## Executar

São dois processos. Abra dois terminais na pasta do projeto.

Terminal 1, API:

```bash
npm run server
```

A API sobe em `http://localhost:3333`. `GET /health` responde `{ "status": "ok" }`.

Terminal 2, interface:

```bash
npm run dev
```

O Vite mostra o endereço local, em geral `http://localhost:5173`.

Login de demonstração: `admin@email.com` / `123456`. Também existe `usuario@email.com` / `senha123`.

Se a API não estiver em `http://localhost:3333`, defina `VITE_API_URL` no `.env`. O CORS aceita o frontend em `localhost` ou `127.0.0.1`, em qualquer porta.

## Rotas da interface

- `/login` — entrada pública
- `/` — painel com totais e um recorte dos favoritos
- `/jogos` — catálogo com busca, filtro, ordenação e paginação no MySQL
- `/jogos/novo` — cadastro
- `/jogos/:id` — detalhe, favoritar, editar e excluir
- `/jogos/:id/editar` — edição
- `/favoritos` — lista local de favoritos

Favoritos ficam no `localStorage` do navegador. O catálogo vem da API e permanece no MySQL depois que o servidor reinicia.

## API

| Método | Rota | Sucesso | Erro |
| --- | --- | --- | --- |
| GET | `/health` | 200 | |
| GET | `/games` | 200, lista completa | |
| GET | `/games/paginated` | 200, página + metadados | 400 query inválida |
| GET | `/games/:id` | 200 | 400 id inválido, 404 inexistente |
| POST | `/games` | 201 | 400 corpo inválido |
| PUT | `/games/:id` | 200 | 400 inválido, 404 inexistente |
| DELETE | `/games/:id` | 204 | 400 id inválido, 404 inexistente |

`GET /games` foi mantido porque a home e a tela de favoritos ainda precisam da lista inteira. A tela de catálogo usa só `/games/paginated`.

Campos obrigatórios no POST e no PUT: `title` (2 a 120 caracteres), `short_description` (10 a 500), `genre` e `platform`. `thumbnail` e `game_url`, quando enviados, precisam ser URL `http` ou `https`. Sem imagem, a API gera uma capa.

Querystring de `/games/paginated`:

- `page`: inteiro a partir de 1, padrão 1.
- `limit`: inteiro de 1 a 50, padrão 10.
- `search`: texto opcional, no máximo 100 caracteres. Filtra o título.
- `genre`: opcional. Vazio significa todos. Existe para o filtro que o catálogo já tinha.
- `sort`: `id` (padrão da API), `title-asc`, `title-desc` ou `genre`. A tela envia `title-asc`.

A ordenação da API, quando `sort` não vem na URL, é `ORDER BY id`. A tela pede nome de A a Z e o repository traduz isso para `ORDER BY title ASC, id ASC`, com o valor escolhido numa lista fechada, sem concatenar texto livre no SQL.

Contrato:

```json
{
  "data": [
    {
      "id": 2,
      "title": "Neon Strike",
      "thumbnail": "data:image/svg+xml;charset=UTF-8,...",
      "short_description": "Tiro tático em arenas neon, com rodadas curtas e ranking semanal.",
      "genre": "Shooter",
      "platform": "PC",
      "game_url": "https://example.com/jogos/neon-strike"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Exemplos da listagem paginada

Primeira página, 10 jogos, sem filtro:

```bash
curl "http://localhost:3333/games/paginated?page=1&limit=10&search="
```

Só títulos que contêm `neon` (há um jogo, Neon Strike):

```bash
curl "http://localhost:3333/games/paginated?page=1&limit=10&search=neon"
```

Segunda página com 5 jogos por página, ordenada por id:

```bash
curl "http://localhost:3333/games/paginated?page=2&limit=5&sort=id"
```

Entrada inválida, resposta `400`:

```bash
curl "http://localhost:3333/games/paginated?page=0&limit=10"
curl -X POST "http://localhost:3333/games" -H "Content-Type: application/json" -d "{\"title\":\"A\"}"
```

A primeira chamada falha porque `page` começa em 1. A segunda falha porque o corpo não tem os campos obrigatórios e o título tem menos de 2 caracteres.

## O que foi preservado

- Login mockado e favoritos no navegador.
- CRUD completo de jogos: criar, listar, detalhar, editar e excluir.
- Filtro por gênero e ordenação do catálogo, agora aplicados no SQL para valer no acervo inteiro, não só na página corrente.
- O botão "Medir filtro" e o comando `npm run measure`. Eles continuam comparando o custo de filtrar uma amostra em memória. A busca do catálogo em si não depende mais desse filtro: ela vai ao MySQL.

Medição antiga nesta máquina, em 09/10/2026: 300 filtros sobre 4000 jogos levaram 2003,93 ms quando o cálculo era refeito toda vez, e 4,12 ms quando o resultado era reutilizado.

## Como verificar

1. Suba o MySQL, rode `npm run db:setup` e `npm run server`.
2. No cliente HTTP, chame os dois exemplos de `/games/paginated` e confira `data`, `total`, `page`, `limit` e `totalPages`.
3. Chame `page=0` e o `POST` sem título válido. Os dois devem responder `400` com `message`.
4. Abra `http://localhost:5173`, entre com o login de demonstração e vá em Jogos.
5. Pesquise `neon`, troque de página com limite visual de 10 (o seed tem 12 jogos, então a página 2 existe) e confira no DevTools a chamada para `/games/paginated`.
6. Cadastre, edite e exclua um jogo. Reinicie a API e confira que o registro continua no MySQL.
