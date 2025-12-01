# 📘 **pomoshot. — Backend**

Backend da aplicação **pomoshot.**, responsável por receber as imagens enviadas pelo usuário, enviá-las ao modelo de IA, validar a resposta e retornar um objeto estruturado contendo:

-  tempo total estimado de estudo
-  título / matéria principal
-  lista de tópicos identificados

Este workspace foi projetado para ser simples e direto: um único endpoint que processa imagens via **Google GenAI** usando **Elysia + Bun**.

---

## 🚀 Visão Geral

Este backend:

-  recebe múltiplas imagens (`multipart/form-data`)
-  converte cada uma para Base64
-  envia as imagens para o modelo **gemini-2.5-flash**
-  força a resposta ser JSON usando `responseMimeType`
-  valida estruturalmente a resposta com **TypeBox**
-  retorna o resultado tipado para o frontend via **Eden Treaty**

O objetivo é ser extremamente enxuto e rápido.

---

## 🛠️ Tecnologias usadas

-  **Bun** (runtime)
-  **Elysia** (framework HTTP)
-  **@elysiajs/cors**
-  **@elysiajs/openapi** (documentação automática)
-  **Google GenAI SDK**
-  **TypeBox** para validação de schema

---

## ▶️ Como rodar o backend

A partir da raiz do monorepo:

```sh
bun install
```

Entre no backend:

```sh
cd backend
```

Crie um arquivo `.env` com sua chave:

```
GEMINI_API_KEY=your_key_here
```

Inicie o servidor:

```sh
bun dev
```

O backend rodará em:

```
http://localhost:3000
```

> O frontend se comunica automaticamente com esse endereço via Eden Treaty.

---

## 📁 Estrutura

```
backend/
  └── src/
      └── index.ts   # Toda lógica da API
```

---

## 🔌 Endpoint principal

### **POST /lessons/extract**

Recebe imagens e retorna:

```json
{
	"totalMinutes": 90,
	"title": "Álgebra Linear — Matrizes",
	"lessons": ["introdução às matrizes", "operações básicas", "matriz identidade"]
}
```

### Corpo da requisição

-  `multipart/form-data`
-  campo: `images` (array de arquivos)

### Respostas

-  **200** → sucesso com conteúdo estruturado
-  **500** → erro interno ou resposta inválida da IA

---

## 🔐 Validação

O backend valida:

1. que o modelo retornou JSON
2. que o JSON possui `totalMinutes`, `title`, `lessons`
3. que os tipos são coerentes

Validation stack:

-  `Value.Check()` para validar
-  `Value.Cast()` para normalizar

---

## 🧭 Roadmap do backend

-  [ ] Validar o conteúdo das imagens (garantir que sejam slides ou materiais de estudo antes do processamento)
-  [ ] Logs estruturados em JSON
-  [ ] Suporte a diferentes modelos de IA
-  [ ] Cache opcional das análises
-  [ ] Exportar schema OpenAPI para documentação externa
-  [ ] Testes automatizados (Elysia + Bun test)

---

## 📌 Status

Workspace em desenvolvimento ativo. Nenhuma licença aplicada ainda.
