# Level Up Live 🎮🎵

**Sistema Local de Live Musical Gamificada**

Transforme suas lives musicais em experiências gamificadas interativas. Controle total sobre níveis, áudio, eventos e integração com OBS via WebSocket, com interface moderna em tema roxo escuro.

## ✨ Features (MVP)

- 🎯 Sistema de progressão com 2 níveis completos
- 🎵 Player de áudio multi-track com análise FFT em tempo real
- 📊 Detecção de drops e buildups no áudio
- ⚡ Sistema de XP/Level com progressão automática
- 🎨 Editor visual de níveis com preview ao vivo
- 📝 Gerenciador de playlist com drag-and-drop
- 🎮 Painel de controle em tempo real para lives
- 📈 Dashboard de métricas e análises
- 🔧 Modo teste/simulação para desenvolvimento

## 🛠️ Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build ultra-rápido)
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- Socket.IO Client
- Framer Motion

**Backend**
- Node.js 20+ LTS
- Express
- Socket.IO
- better-sqlite3
- Howler.js (áudio)
- Web Audio API

## 📋 Requisitos

- **Node.js 20+ LTS** ([download](https://nodejs.org/))
- **OBS Studio 30+** com OBS WebSocket 5.x habilitado
- **Windows/Mac/Linux** com navegador moderno

## 🚀 Início Rápido

### 1. Clone ou prepare o repositório

```bash
cd level-up-live
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

```bash
cp .env.example .env
```

Edite `.env` conforme necessário (paths, volumes, etc).

### 4. Crie o banco de dados

```bash
npm run db:migrate
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Isso abre **frontend** em `http://localhost:5173` e **backend** em `http://localhost:3000`.

## 📁 Estrutura do Projeto

```
level-up-live/
├── src/
│   ├── client/          # Frontend React
│   ├── server/          # Backend Express
│   └── shared/          # Types compartilhados
├── assets/              # Imagens, sons, música
├── data/                # Database + logs (gitignored)
├── docs/                # Documentação (PRD, etc)
├── CLAUDE.md            # Guia para Claude Code
└── package.json
```

## 🎯 Available Scripts

```bash
# Development
npm run dev              # Roda frontend + backend
npm run dev:client      # Apenas frontend
npm run dev:server      # Apenas backend

# Build
npm run build           # Build completo
npm run build:client    # Build frontend
npm run build:server    # Build backend

# Database
npm run db:migrate      # Cria tabelas
npm run db:seed         # Popula dados de exemplo
npm run db:reset        # Reseta banco completo

# Qualidade
npm run type-check      # TypeScript check
npm run lint            # ESLint
npm run format          # Prettier

# Testing
npm run test            # Vitest
npm run test:ui         # Vitest com UI
```

## 🎨 Design System

**Tema:** Dark Purple

```
Primary:    #8B5CF6
Secondary:  #6366F1
Accent:     #EC4899
Background: #0F0A1E
Surface:    #1A1332
```

Todos os componentes usam Tailwind + shadcn/ui. Veja `src/client/src/styles/globals.css`.

## 📖 Documentação

- **[PRD Completo](docs/PRD.md)** - Especificação completa do projeto
- **[CLAUDE.md](CLAUDE.md)** - Guia para assistentes de IA
- **[src/shared/types.ts](src/shared/types.ts)** - Types TypeScript compartilhados

## 🔧 Desenvolvimento

### Adicionar uma nova página

1. Crie o arquivo em `src/client/src/pages/`
2. Adicione a rota em `src/client/src/App.tsx`
3. Atualize navegação em `src/client/src/components/layout/Sidebar.tsx`

### Adicionar um novo endpoint API

1. Crie o controller em `src/server/controllers/`
2. Implemente a lógica em `src/server/services/`
3. Use o repository em `src/server/database/repositories/`
4. Registre a rota em `src/server/app.ts`

### WebSocket Events

Todos os eventos estão documentados no [PRD](docs/PRD.md#websocket-events-socket-io).

## 🐛 Troubleshooting

**"Port 3000 already in use"**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

**"better-sqlite3 build errors"**
Certifique-se de ter Visual Studio Build Tools ou Python 3 instalados.

**"WebSocket não conecta"**
Verifique se o backend está rodando em `:3000` e o frontend consegue acessar.

## 📝 Notas de Desenvolvimento

- Sempre use `/` nos paths (Node.js no Windows converte automaticamente)
- Valide inputs com Zod antes de salvar no banco
- Use as repositories para acesso ao DB (nunca SQL raw)
- Emita eventos Socket.IO para real-time updates
- Mantenha a estrutura de pastas organizada conforme o PRD

## 🎬 Roadmap

**Sprint 1** ✅ Foundation (Vite, React, Express, SQLite, layout)
**Sprint 2** ⏳ Audio Engine (Howler.js, Web Audio API, análise)
**Sprint 3** ⏳ Database & XP System (CRUD, progressão)
**Sprint 4** ⏳ Playlist Manager (gerenciar músicas)
**Sprint 5** ⏳ Live Control Panel (painel de controle)
**Sprint 6** ⏳ Layer System & Editor Visual (editor de cenas)
**Sprint 7** ⏳ Sound System (sons personalizados)
**Sprint 8** ⏳ Integration & Testing
**Sprint 9** ⏳ Polish & Documentation

Veja [docs/PRD.md](docs/PRD.md) para detalhes completos.

## 📄 Licença

Projeto em desenvolvimento. Licença TBD.

## 🙏 Créditos

Desenvolvido com ❤️ para streamers musicais.
