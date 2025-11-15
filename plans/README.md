# Planos de Execução do Projeto Level Up Live

Este diretório contém os planos de execução detalhados para o desenvolvimento do MVP do projeto Level Up Live. Cada arquivo representa uma sprint de desenvolvimento, com objetivos, entregáveis e passos técnicos claros.

## Índice de Planos

- **[Plano 01: Foundation](./01-foundation.md)**
  - **Escopo:** Setup inicial do projeto, incluindo estrutura de pastas, dependências de frontend e backend, configuração de UI com Tailwind/shadcn, e scripts iniciais do banco de dados e `package.json`.

- **[Plano 02: Audio Engine](./02-audio-engine.md)**
  - **Escopo:** Implementação do motor de áudio para tocar músicas e efeitos, análise de áudio em tempo real (FFT, BPM, energia) e comunicação via WebSockets.

- **[Plano 03: Level System](./03-level-system.md)**
  - **Escopo:** Desenvolvimento do sistema de níveis e XP, incluindo o editor visual para criar e gerenciar os níveis, camadas, sons e a persistência no banco de dados.

- **[Plano 04: Web Live Stage](./04-web-live.md)**
  - **Escopo:** Criação da página web dedicada (`/live`) que renderiza a cena visual do nível atual. Esta página será a fonte de captura para o OBS, eliminando a necessidade de integração direta.

- **[Plano 05: Playlist Manager](./05-playlist-manager.md)**
  - **Escopo:** Construção da interface de gerenciamento da playlist, com funcionalidades de drag-and-drop, ordenação, e integração com o motor de áudio.
