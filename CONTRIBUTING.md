# Contribuindo com o pomoshot

Obrigado pelo interesse. Este guia explica como preparar o ambiente, o que esperamos de um pull request e como reportar problemas.

## Antes de começar

- **Bug ou ideia?** Procure nas [issues](https://github.com/P0sseid0n/pomoshot/issues) antes de abrir uma nova. Se não encontrar, use os modelos de [bug](https://github.com/P0sseid0n/pomoshot/issues/new?template=bug.yml) ou de [sugestão](https://github.com/P0sseid0n/pomoshot/issues/new?template=feature.yml).
- **Vai trabalhar em algo?** Comente na issue para que ela seja atribuída a você. Isso evita duas pessoas fazendo a mesma coisa.
- **Mudança grande** (nova tela, nova dependência, mudança na API): abra uma issue para discutir a ideia antes de escrever código.
- **Primeira contribuição?** Procure issues com a label [`good first issue`](https://github.com/P0sseid0n/pomoshot/labels/good%20first%20issue).

## Ambiente de desenvolvimento

Você vai precisar de [Bun](https://bun.sh) 1.3+, [Docker](https://www.docker.com/) (ou um Redis local) e uma chave da [API do Gemini](https://aistudio.google.com/apikey).

```sh
git clone https://github.com/<seu-usuario>/pomoshot.git
cd pomoshot
bun install

cp backend/.env.example backend/.env     # preencha GEMINI_API_KEY
cp frontend/.env.example frontend/.env

docker compose up -d redis
bun dev
```

O frontend sobe em `http://localhost:5173` e o backend em `http://localhost:3000`.

### Rate limit durante o desenvolvimento

O backend permite **uma extração por IP a cada hora**. Para testar de novo sem esperar, limpe a chave no Redis:

```sh
docker exec pomoshot-redis sh -c "redis-cli --scan --pattern 'pomo:*' | xargs -r redis-cli del"
```

## Estrutura

| Pasta                              | O que tem                                                       |
| ---------------------------------- | --------------------------------------------------------------- |
| `backend/src/modules/`             | rotas Elysia, uma pasta por módulo, com `index.ts` e `model.ts` |
| `backend/src/services/`            | regras que usam serviços externos (Redis)                       |
| `backend/src/lib/`                 | instâncias de clientes (Gemini, Redis)                          |
| `frontend/src/components/screens/` | uma tela por etapa do fluxo                                     |
| `frontend/src/components/ui/`      | componentes reutilizáveis (Button, Header, Segmented…)          |
| `frontend/src/main.css`            | tokens de cor e tema (claro/escuro) do Tailwind                 |

O frontend importa o tipo `App` do backend (`@pomoshot/backend`). Se você mudar o formato de uma rota, o TypeScript do frontend aponta onde ajustar.

## Padrões de código

- **TypeScript** em tudo, sem `any` desnecessário.
- **Formatação**: feita pelo [Prettier](https://prettier.io) (`.prettierrc.json`), que também ordena os imports. O `.editorconfig` alinha o editor: tabs, LF, UTF-8. No VS Code, instale as extensões recomendadas e ative _format on save_.
- **Textos da interface** em português, em letras minúsculas, que é a identidade visual do projeto.
- **Cores**: use os tokens do tema (`bg-paper`, `text-ink`, `text-ink-muted`, `bg-accent`…), não cores fixas do Tailwind como `neutral-500` ou `red-500`. Assim o modo escuro funciona sem esforço extra.
- **Acessibilidade**: elementos clicáveis são `<button>` ou `<a>`, botões só com ícone têm `aria-label`, e tudo precisa funcionar pelo teclado.
- **Sem `alert()`** e sem `console.log` de debug no código enviado.

Antes de abrir o PR, rode:

```sh
bun run format          # na raiz: formata tudo
bun run format:check    # só verifica, sem alterar

cd frontend
bun run lint
bun run build           # inclui a checagem de tipos (tsc -b)
```

## Commits

Use mensagens curtas no imperativo, com um prefixo indicando o tipo:

```
feat: adiciona histórico de sessões
fix: corrige contagem de blocos quando sobra tempo
docs: atualiza instruções do Redis
refactor: extrai Header compartilhado
```

Prefixos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Pull requests

1. Faça um fork e crie uma branch a partir da `main`: `feat/historico-de-sessoes`, `fix/rate-limit-mensagem`.
2. Mantenha o PR focado em um assunto. Refatorações não relacionadas vão em outro PR.
3. Preencha o modelo do PR: o que mudou, como testar e prints quando a interface mudar.
4. Referencie a issue com `Closes #123`.

> **Importante:** todo push na `main` dispara o deploy em produção. Nunca faça push direto na `main`. Toda mudança entra por pull request.

## Reportando vulnerabilidades

Não abra uma issue pública para falhas de segurança. Entre em contato pelo site [p0sseid0n.dev](https://p0sseid0n.dev/).

## Licença

Ao contribuir, você concorda que seu código será distribuído sob a [AGPL-3.0](./LICENSE), a mesma licença do projeto.
