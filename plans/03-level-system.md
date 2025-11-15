---
id: plan-03
title: Sprint 03 – Level System
status: ready
depends_on: [plan-02]
owners: [you]
---

### Objetivo
Desenvolver o sistema de níveis e progressão de XP, que é o coração da gamificação. Isso inclui a criação da estrutura de dados dos níveis, o serviço para calcular XP, e a construção do Editor de Níveis, uma interface visual que permitirá ao usuário criar e customizar seus próprios níveis com camadas, sons e configurações.

### Entregáveis
- API REST para CRUD de Níveis (`/api/levels`).
- Serviço de backend (`XPService`) para processar eventos e calcular a progressão de XP.
- Página de Edição de Níveis (`/editor`) com interface para gerenciar a lista de níveis.
- Editor visual com abas para configurar camadas (imagens), sons, e parâmetros (nome, XP necessário).
- Componente de preview que renderiza a cena do nível conforme é editada.
- Persistência de todos os dados dos níveis no banco de dados SQLite.

### Passos (execução)
1.  **Criar Repositório e Controller de Níveis:**
    - `src/server/database/repositories/LevelRepository.ts`: Implementar funções `create`, `read`, `update`, `delete` para a tabela `levels`.
    - `src/server/controllers/LevelController.ts`: Criar os handlers para as rotas da API REST que utilizam o repositório.
2.  **Criar o `XPService` (`src/server/services/XPService.ts`):**
    - Implementar a lógica para `addXP`, que recebe uma fonte (ex: `audioDrop`), calcula o valor com base na configuração e atualiza o estado atual da sessão.
    - Adicionar a função `checkForLevelUp`, que compara o XP atual com o `xpThreshold` do próximo nível.
    - Quando um level up ocorre, emitir um evento `level:up` via WebSocket.
3.  **Desenvolver a Página `LevelEditor` (`src/client/pages/LevelEditor.tsx`):**
    - Criar o layout principal com uma lista de níveis na lateral e a área de edição principal.
    - Usar `React Router` para criar a rota `/editor`.
4.  **Implementar a Lista de Níveis (`src/client/components/level/LevelList.tsx`):**
    - Buscar os níveis da API e exibi-los.
    - Adicionar funcionalidade para criar um novo nível e reordenar a lista (drag-and-drop).
5.  **Construir o Editor com Abas (`src/client/components/level/MainEditor.tsx`):**
    - **Aba Visual:** Criar o `LayerManager` para adicionar, remover e reordenar camadas (background, stage, etc.).
    - **Aba Sons:** Criar seletores de arquivos para associar sons de `transição` and `levelUp`.
    - **Aba Config:** Criar campos de formulário para `name`, `xpThreshold`, etc.
6.  **Desenvolver o `LivePreview` (`src/client/components/level/LivePreview.tsx`):**
    - Criar um componente que recebe o estado do nível sendo editado e renderiza as camadas de imagem em ordem (z-index), aplicando transformações básicas se necessário.
7.  **Integrar com o Backend:**
    - Conectar os formulários do editor para que as alterações sejam salvas na API via `POST` ou `PUT`.

### Alterações/Arquivos
- `/src/server/database/repositories/LevelRepository.ts`
- `/src/server/controllers/LevelController.ts`
- `/src/server/services/XPService.ts`
- `/src/shared/level.types.ts`
- `/src/client/pages/LevelEditor.tsx`
- `/src/client/components/level/LevelList.tsx`
- `/src/client/components/level/MainEditor.tsx`
- `/src/client/components/level/LayerManager.tsx`
- `/src/client/components/level/LivePreview.tsx`
- `/src/client/hooks/useLevels.ts`
- `/plans/03-level-system.md`

### Critérios de aceite
- [ ] É possível criar, editar e deletar um nível através da interface do Editor de Níveis.
- [ ] As alterações feitas em um nível (ex: adicionar uma camada de imagem) são refletidas em tempo real no componente `LivePreview`.
- [ ] Ao salvar, todas as configurações do nível são persistidas no banco de dados SQLite.
- [ ] O backend processa eventos de XP e emite um evento `level:up` quando o `xpThreshold` é atingido.

### Riscos/Rollback
- **Risco:** A complexidade do editor visual, especialmente o `LayerManager` com drag-and-drop, pode ser subestimada.
- **Rollback:** Simplificar o editor, removendo o drag-and-drop e usando uma lista simples de camadas. Adiar o preview em tempo real e focar apenas em salvar os dados e recarregar para ver o resultado.

### Prompt para Claude Code
```
Leia este plano (./03-level-system.md) e execute os Passos em ordem. Ao finalizar, valide os Critérios de aceite e reporte o status de cada item.
```
