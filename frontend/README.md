# pomoshot. — frontend

Interface do [pomoshot](../README.md): envio das capturas, configuração dos blocos e o cronômetro pomodoro.

Feito com **React 19 + TypeScript + Tailwind CSS v4** e **Vite**. As chamadas à API usam **Eden Treaty**, que tipa as requisições a partir do próprio backend.

---

## Rodando

A partir da raiz do monorepo:

```sh
bun install
cp frontend/.env.example frontend/.env
bun --filter '@pomoshot/frontend' dev
```

A aplicação sobe em `http://localhost:5173`. Para o fluxo completo, o [backend](../backend/README.md) também precisa estar rodando.

### Variáveis de ambiente

| Variável       | Obrigatória | Descrição                                    |
| -------------- | ----------- | -------------------------------------------- |
| `VITE_API_URL` | sim         | URL do backend, ex.: `http://localhost:3000` |

Sem ela, o app lança `VITE_API_URL não definida` ao carregar.

### Scripts

| Comando           | O que faz                                       |
| ----------------- | ----------------------------------------------- |
| `bun dev`         | servidor de desenvolvimento                     |
| `bun run build`   | checagem de tipos (`tsc -b`) + build em `dist/` |
| `bun run lint`    | ESLint                                          |
| `bun run preview` | serve o build localmente                        |

---

## Fluxo de telas

O `App.tsx` controla a etapa atual (`ScreenStage`) e renderiza uma tela por vez:

| Etapa        | Componente       | O que acontece                                                                 |
| ------------ | ---------------- | ------------------------------------------------------------------------------ |
| início       | `StartScreen`    | apresentação e botão para começar                                              |
| upload       | `UploadScreen`   | envio por clique, arrastar e soltar ou `ctrl+v`; chama `POST /lessons/extract` |
| configuração | `SetupScreen`    | escolha de foco e pausa, com prévia proporcional da sessão                     |
| pomodoro     | `PomodoroScreen` | cronômetro, progresso por bloco e tela de conclusão                            |

A divisão em blocos é feita por `generateSessionsData` (`src/utils`): cada tópico vira um bloco de foco, com uma pausa entre eles, até cobrir o `totalMinutes` estimado pela IA.

### No cronômetro

- **espaço** inicia e pausa
- o tempo restante aparece no título da aba
- um som (`public/sounds/bell.mp3`) toca na troca de bloco
- na pausa, o fundo ganha um tom quente

---

## Estrutura

```
src/
├── api/                 cliente Eden Treaty
├── components/
│   ├── screens/         uma tela por etapa
│   ├── ui/              Button, Header, Footer, Logo, Segmented
│   └── icons/           ícones SVG
├── types/               LessonData, PomodoroSession, ScreenStage
├── utils/               geração dos blocos
├── main.css             tokens do tema e estilos base
└── main.tsx             entry point
public/
├── favicon.svg
└── sounds/bell.mp3
```

---

## Tema e estilo

As cores são tokens definidos em `src/main.css` e expostos ao Tailwind via `@theme`:

| Token                                   | Uso                                        |
| --------------------------------------- | ------------------------------------------ |
| `paper` / `surface` / `sunken`          | fundos, do mais baixo ao mais alto         |
| `ink` / `ink-muted` / `ink-faint`       | texto, do mais forte ao mais fraco         |
| `line`                                  | bordas e divisores                         |
| `accent` / `accent-soft` / `accent-ink` | o vermelho tomate, a única cor de destaque |

O modo escuro troca os valores dos tokens via `prefers-color-scheme`, então qualquer componente que use `bg-paper`, `text-ink` etc. já funciona nos dois temas. Evite cores fixas como `neutral-500` ou `red-500`.

Fontes: **Geist** para texto e **Geist Mono** para números (timer, durações, contadores), carregadas do Google Fonts no `index.html`.

---

## Comunicação com o backend

```ts
import { Client } from './api'

const { data, error } = await Client.lessons.extract.post({ images: files })
```

O tipo `App` vem do pacote `@pomoshot/backend`. Se uma rota mudar no backend, o TypeScript aponta os pontos a ajustar aqui.

---

Próximos passos ficam nas [issues com a label `frontend`](https://github.com/P0sseid0n/pomoshot/issues?q=is%3Aopen+label%3Afrontend). Licenciado sob a [AGPL-3.0](../LICENSE).
