# 📘 **pomoshot. — Frontend**

Frontend da aplicação **pomoshot.**, responsável pela interface onde o usuário envia capturas de tela, configura seus blocos de estudo e utiliza o cronômetro Pomodoro gerado a partir da análise por IA.

---

## 🚀 Visão Geral

Este workspace contém a interface construída com **React + TypeScript**, utilizando **Tailwind CSS** para estilização e **Eden Treaty** para comunicação tipada com o backend Elysia.

O frontend é totalmente focado em:

-  Upload de imagens (drag & drop, input e paste)
-  Visualização das capturas
-  Processamento assíncrono com feedback de loading
-  Configuração dos blocos de estudo (foco/pausa)
-  Execução do cronômetro Pomodoro
-  Fluxo suave entre telas

Este projeto foi estruturado para ser simples, direto e fácil de expandir.

---

## 🛠️ Tecnologias usadas

-  **React**
-  **TypeScript**
-  **Tailwind CSS**
-  **Eden Treaty** (cliente HTTP tipado)
-  **Bun** (para desenvolvimento)

---

## ▶️ Como rodar o frontend

A partir da raiz do monorepo:

```sh
bun install
```

Entre no workspace:

```sh
cd frontend
```

Inicie o servidor de desenvolvimento:

```sh
bun dev
```

A aplicação estará disponível em:

```
http://localhost:3000
```

Caso a porta seja diferente, o terminal exibirá o endereço correto.

---

## 📁 Estrutura de pastas

```
frontend/
  ├── src/
      ├── api/            # Cliente Eden Treaty
      ├── components/     # Componentes reutilizáveis e telas
      ├── icons/          # Ícones SVG customizados
      ├── ui/             # Elementos básicos de interface
      ├── utils/          # Funções auxiliares
      ├── types/          # Tipagens centrais
      ├── public/         # Arquivos estáticos
      └── main.tsx        # Entry point
```

---

## 🔄 Fluxo do usuário

1. **UploadScreen** — Usuário envia imagens (drag & drop / paste)
2. **ProcessingScreen** — IA analisa lições
3. **SetupScreen** — Define blocos de foco/pausa
4. **PomodoroScreen** — Timer executa as sessões

As telas são controladas pelo `App.tsx` via enum de estágios.

---

## 🔌 Comunicação com o backend

A comunicação é feita usando **Eden Treaty**, que gera um cliente HTTP totalmente tipado com base nas rotas do backend.

Exemplo:

```ts
const { data, error } = await Client.lessons.extract.post({ images })
```

Isso garante **tipos consistentes** entre backend e frontend.

---

## 🧭 Próximos passos (Roadmap do frontend)

-  [ ] Modo escuro
-  [ ] Melhorias visuais no cronômetro
-  [ ] Animações (Framer Motion)
-  [ ] Edição manual dos blocos de estudo
-  [ ] Histórico local de sessões concluídas
-  [ ] Suporte total para mobile
-  [ ] Feedback sonoro ao final do bloco

---

## 📌 Status

Workspace em desenvolvimento ativo. Nenhuma licença aplicada ainda.
