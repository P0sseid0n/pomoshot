# pomoshot. — backend

API do [pomoshot](../README.md). Recebe as capturas de tela, envia para o Gemini, valida a resposta e devolve o assunto, os tópicos e o tempo estimado de estudo. Também aplica o rate limit por IP usando o Redis.

Feito com **Bun + Elysia**. O tipo do app (`App`) é exportado e consumido pelo frontend via **Eden Treaty**, então a API é tipada de ponta a ponta.

---

## Stack

| Pacote                | Uso                                             |
| --------------------- | ----------------------------------------------- |
| `elysia`              | servidor HTTP e validação do body (`t.Files`)   |
| `@google/genai`       | chamada ao `gemini-2.5-flash` com resposta JSON |
| `@sinclair/typebox`   | validação da resposta da IA (`Value.Parse`)     |
| `redis` + `elysia-ip` | rate limit por IP                               |
| `@elysiajs/cors`      | CORS                                            |
| `@elysiajs/openapi`   | documentação automática em `/openapi`           |

---

## Rodando

A partir da raiz do monorepo:

```sh
bun install
cp backend/.env.example backend/.env    # preencha GEMINI_API_KEY
docker compose up -d redis
bun --filter '@pomoshot/backend' dev
```

A API sobe em `http://localhost:3000` e a documentação fica em `http://localhost:3000/openapi`.

### Variáveis de ambiente

| Variável         | Obrigatória | Descrição                | Padrão                   |
| ---------------- | ----------- | ------------------------ | ------------------------ |
| `GEMINI_API_KEY` | sim         | chave da API do Gemini   | —                        |
| `REDIS_URL`      | não         | URL de conexão do Redis  | `redis://localhost:6379` |
| `CORS_ORIGIN`    | não         | origem permitida no CORS | qualquer origem          |

### Scripts

| Comando         | O que faz                                             |
| --------------- | ----------------------------------------------------- |
| `bun dev`       | servidor com recarregamento automático                |
| `bun run build` | gera o bundle em `dist/`                              |
| `bun run types` | gera os tipos em `dist-types/` (usados pelo frontend) |
| `bun start`     | roda o bundle em modo produção                        |

---

## Estrutura

```
src/
├── index.ts                  app Elysia: CORS, OpenAPI e rate limit
├── modules/lessons/
│   ├── index.ts              rota POST /lessons/extract
│   └── model.ts              schemas do body e da resposta
├── services/redis.ts         leitura e escrita do cache por IP
├── lib/
│   ├── gemini.ts             cliente do Gemini
│   └── redis.ts              cliente do Redis (conecta na inicialização)
├── errors/ResponseError.ts   erro padronizado da API
├── types/                    tipos compartilhados
└── utils/                    helpers (ex.: arquivo → base64)
```

---

## API

### `POST /lessons/extract`

Recebe as imagens em `multipart/form-data`, no campo `images` (um ou mais arquivos).

```sh
curl -F "images=@aula1.png" -F "images=@aula2.png" http://localhost:3000/lessons/extract
```

**200**

```json
{
  "totalMinutes": 85,
  "title": "Fundamentos de Redes de Computadores",
  "lessons": ["Modelo OSI e TCP/IP", "Endereçamento IPv4", "Sub-redes na prática"]
}
```

**Erros** seguem sempre o mesmo formato:

```json
{ "error": "Rate limit exceeded", "code": 429 }
```

`details` aparece só em alguns erros 500, com a mensagem original da falha.

| Status | Quando                                                |
| ------ | ----------------------------------------------------- |
| `429`  | o IP já fez uma extração na última hora               |
| `500`  | falha na chamada ao Gemini ou resposta fora do schema |

### Como a extração funciona

1. Cada imagem é convertida para base64 e enviada ao Gemini junto com o prompt.
2. O modelo responde em JSON (`responseMimeType: application/json`) seguindo um `responseJsonSchema`.
3. A resposta é validada com `Value.Parse`. Se não bater com o schema, a API devolve 500.
4. Em caso de sucesso, o resultado é gravado no Redis e liberado para o frontend.

### Rate limit

Cada extração bem-sucedida grava `pomo:<ip>` no Redis com expiração de **1 hora**. Enquanto a chave existir, o hook `onBeforeHandle` responde 429 para aquele IP. O IP vem dos headers do proxy (`elysia-ip` com `headersOnly: true`); sem proxy, cai em `127.0.0.1`.

Para liberar o seu IP durante o desenvolvimento:

```sh
docker exec pomoshot-redis sh -c "redis-cli --scan --pattern 'pomo:*' | xargs -r redis-cli del"
```

---

## Problemas comuns

**`ECONNREFUSED 127.0.0.1:6379` ao iniciar**: o Redis não está rodando. Rode `docker compose up -d redis` na raiz e reinicie o servidor. (Fazer o backend subir mesmo sem Redis está na [#2](https://github.com/P0sseid0n/pomoshot/issues/2).)

---

Próximos passos ficam nas [issues com a label `backend`](https://github.com/P0sseid0n/pomoshot/issues?q=is%3Aopen+label%3Abackend). Licenciado sob a [AGPL-3.0](../LICENSE).
