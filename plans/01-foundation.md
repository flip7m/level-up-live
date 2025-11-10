---
id: plan-01
title: Sprint 01 – Foundation
status: ready
depends_on: []
owners: [you]
---

### Objetivo
Estabelecer a fundação completa do projeto, criando a estrutura de pastas, configurando os ambientes de frontend e backend, instalando todas as dependências essenciais e preparando o sistema de build. O resultado será uma aplicação "hello world" funcional, com o tema visual aplicado e pronta para o desenvolvimento das próximas funcionalidades.

### Entregáveis
- Repositório com estrutura de pastas para client (React/Vite) e server (Express/TS).
- `package.json` configurado com todos os scripts de desenvolvimento, build e banco de dados.
- Frontend configurado com TypeScript, TailwindCSS e shadcn/ui (com o tema roxo escuro).
- Backend configurado com Express, TypeScript, e Socket.IO.
- Conexão com banco de dados SQLite e script inicial de migração.
- Aplicação base rodando com `npm run dev`.

### Passos (execução)
1.  **Criar Estrutura de Pastas:**
    ```bash
    mkdir -p src/client/src/pages src/client/src/components/ui src/client/src/lib src/server/database/migrations src/server/services src/server/controllers src/shared data/logs assets
    ```
2.  **Inicializar Projeto Node e Instalar Dependências:**
    ```bash
    npm init -y
    npm install express socket.io better-sqlite3 concurrently nodemon typescript ts-node @types/express @types/node
    npm install react react-dom react-router-dom socket.io-client zustand @tanstack/react-query framer-motion lucide-react tailwind-merge clsx
    npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
    ```
3.  **Configurar TypeScript (`tsconfig.json`):**
    - Criar um `tsconfig.json` na raiz para o frontend e um `tsconfig.server.json` para o backend.
4.  **Configurar Vite (`vite.config.ts`):**
    - Criar o arquivo de configuração para o cliente React.
5.  **Configurar TailwindCSS:**
    - Executar `npx tailwindcss init -p` para criar `tailwind.config.js` e `postcss.config.js`.
    - Configurar o `tailwind.config.js` com o tema roxo escuro, conforme o PRD.
6.  **Inicializar `shadcn/ui`:**
    - Executar `npx shadcn-ui@latest init` e configurar o `components.json`.
7.  **Criar Servidor Express Básico (`src/server/index.ts`):**
    - Configurar um servidor Express simples que sirva o cliente Vite em modo de desenvolvimento e os arquivos estáticos em produção.
8.  **Configurar Scripts do `package.json`:**
    - Adicionar os scripts `dev`, `build`, `start`, `lint`, `db:migrate` conforme o PRD.
9.  **Criar Migração Inicial do Banco (`src/server/database/migrations/001_initial.sql`):**
    - Adicionar as `CREATE TABLE` para `levels`, `events`, `songs`, `live_sessions`, `xp_history`, e `config`.
10. **Criar Script de Migração (`src/server/database/migrate.ts`):**
    - Criar um script que leia e execute os arquivos `.sql` da pasta de migrações.

### Alterações/Arquivos
- `/package.json`
- `/vite.config.ts`
- `/tailwind.config.js`
- `/postcss.config.js`
- `/tsconfig.json`
- `/tsconfig.server.json`
- `/src/client/main.tsx`
- `/src/client/App.tsx`
- `/src/server/index.ts`
- `/src/server/database/db.ts`
- `/src/server/database/migrations/001_initial.sql`
- `/src/server/database/migrate.ts`
- `/plans/01-foundation.md`

### Critérios de aceite
- [ ] O comando `npm run dev` inicia o frontend e o backend sem erros.
- [ ] Acessar `http://localhost:5173` mostra uma página em branco com o fundo roxo escuro (`#0F0A1E`).
- [ ] O script `npm run db:migrate` cria o arquivo `data/app.db` com as tabelas iniciais.
- [ ] A estrutura de pastas e arquivos principal está criada conforme o PRD.

### Riscos/Rollback
- **Risco:** Incompatibilidade entre versões de dependências.
- **Rollback:** Remover `node_modules` e `package-lock.json`, ajustar as versões no `package.json` e reinstalar. Para problemas maiores, reverter o commit.

### Prompt para Claude Code
```
Leia este plano (./01-foundation.md) e execute os Passos em ordem. Ao finalizar, valide os Critérios de aceite e reporte o status de cada item.
```
