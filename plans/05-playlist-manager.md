---
id: plan-05
title: Sprint 05 – Playlist Manager
status: ready
depends_on: [plan-02]
owners: [you]
---

### Objetivo
Construir uma interface de gerenciamento de playlist robusta e intuitiva, permitindo que o usuário adicione músicas, reordene a fila com drag-and-drop, e controle as opções de repetição e ordem aleatória. A playlist deve ser integrada ao motor de áudio para garantir a reprodução contínua e automatizada das faixas.

### Entregáveis
- API REST para CRUD de músicas na playlist (`/api/playlist`).
- Página de Gerenciamento de Playlist (`/playlist`) com uma interface de arrastar e soltar.
- Zona de upload (dropzone) para adicionar novos arquivos de música (MP3, WAV) à playlist.
- Extração de metadados básicos (título, artista, duração) dos arquivos de áudio no backend.
- Integração com o `AudioEngineController` para tocar as músicas da playlist em sequência.
- Controles de UI para ativar/desativar loop e shuffle.
- Persistência da playlist e sua ordem no banco de dados SQLite.

### Passos (execução)
1.  **Instalar Dependências:**
    ```bash
    npm install dnd-kit music-metadata
    ```
2.  **Criar Repositório e Controller da Playlist:**
    - `src/server/database/repositories/SongRepository.ts`: Implementar funções para adicionar, remover, e reordenar músicas na tabela `songs`.
    - `src/server/controllers/PlaylistController.ts`: Criar handlers para a API REST, incluindo um endpoint para upload de arquivos de áudio.
3.  **Implementar Lógica de Upload e Extração de Metadados:**
    - No `PlaylistController`, ao receber um arquivo, salvá-lo na pasta `assets/music`.
    - Usar a biblioteca `music-metadata` para ler o arquivo e extrair `title`, `artist`, e `duration`.
    - Salvar as informações da música no banco de dados.
4.  **Desenvolver a Página `PlaylistManager` (`src/client/pages/PlaylistManager.tsx`):**
    - Criar o layout da página com a lista de músicas e os controles (loop, shuffle).
    - Adicionar a rota `/playlist` em `src/client/App.tsx`.
5.  **Implementar a Lista com Drag-and-Drop (`src/client/components/playlist/SongList.tsx`):**
    - Usar `@dnd-kit` para criar uma lista onde os itens (`SongItem`) podem ser arrastados para reordenar.
    - Ao soltar um item, chamar a API para salvar a nova ordem no backend.
6.  **Criar a Dropzone de Upload (`src/client/components/playlist/DropZone.tsx`):**
    - Implementar uma área que aceite o arraste de arquivos do sistema operacional.
    - Ao soltar arquivos de áudio, fazer o upload para a API do backend.
7.  **Integrar com o `AudioEngineController`:**
    - Modificar o `AudioEngineController` para, ao final de uma música (`onend` event do Howler), solicitar a próxima faixa ao `PlaylistController`.
    - Implementar a lógica de `loop` (voltar à primeira música) e `shuffle` (pegar uma música aleatória) no backend.

### Alterações/Arquivos
- `/src/server/database/repositories/SongRepository.ts`
- `/src/server/controllers/PlaylistController.ts`
- `/src/client/pages/PlaylistManager.tsx`
- `/src/client/components/playlist/SongList.tsx`
- `/src/client/components/playlist/SongItem.tsx`
- `/src/client/components/playlist/DropZone.tsx`
- `/src/client/hooks/usePlaylist.ts`
- `/plans/05-playlist-manager.md`

### Critérios de aceite
- [ ] É possível arrastar e soltar um arquivo MP3 na `DropZone` para adicioná-lo à playlist.
- [ ] É possível reordenar as músicas na lista arrastando e soltando.
- [ ] A ordem da playlist é salva e recarregada ao atualizar a página.
- [ ] Quando uma música termina, a próxima da lista começa a tocar automaticamente.
- [ ] Ativar o modo "Loop" faz a playlist recomeçar ao chegar ao fim.

### Riscos/Rollback
- **Risco:** A extração de metadados pode falhar ou ser inconsistente entre diferentes arquivos de áudio.
- **Rollback:** Se a extração de metadados for problemática, usar apenas o nome do arquivo como título e remover os campos de artista/duração da UI. A funcionalidade principal de playback não será afetada.

### Prompt para Claude Code
```
Leia este plano (./05-playlist-manager.md) e execute os Passos em ordem. Ao finalizar, valide os Critérios de aceite e reporte o status de cada item.
```
