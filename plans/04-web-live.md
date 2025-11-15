---
id: plan-04
title: Sprint 04 – Web Live Stage
status: ready
depends_on: [plan-03]
owners: [you]
---

### Objetivo
Criar a "saída de vídeo" do sistema: uma página web dedicada, em tela cheia, que renderiza a cena visual do nível atual. Esta página, referida como "Live Stage", será a fonte que o streamer irá capturar no OBS (ou software similar) para a transmissão, eliminando a necessidade de qualquer integração técnica ou automação com o OBS.

### Entregáveis
- Uma nova rota e página no frontend: `/live`.
- A página `/live` renderiza as camadas visuais do nível ativo em tela cheia.
- A página reage a eventos de WebSocket (`level:up`, `event:triggered`) para atualizar a cena em tempo real.
- Opções de visualização, como ocultar o cursor do mouse.
- Instruções claras para o usuário sobre como configurar uma fonte de "Captura de Janela" ou "Browser Source" no OBS apontando para `http://localhost:5173/live`.

### Passos (execução)
1.  **Criar a Rota e a Página `LiveStage`:**
    - Em `src/client/App.tsx`, adicionar uma nova rota para o caminho `/live` que renderize o componente `LiveStage.tsx`.
    - Criar o arquivo `src/client/pages/LiveStage.tsx`.
2.  **Desenvolver o Componente `LiveStage`:**
    - O componente deve se conectar aos WebSockets e ouvir os eventos de estado da live, como `live:state` e `level:up`.
    - Com base no `currentLevel` recebido, buscar os dados completos do nível (camadas, etc.) no estado global (Zustand) ou via API.
    - Renderizar as camadas (`layers`) do nível em tela cheia, na ordem correta, similarmente ao `LivePreview` do editor, mas ocupando a tela inteira.
3.  **Estilizar para Tela Cheia e Imersão:**
    - Adicionar CSS para que o corpo da página e o contêiner principal ocupem 100% da altura e largura da janela (`width: 100vw; height: 100vh`).
    - Remover barras de rolagem (`overflow: hidden`).
    - Adicionar uma regra de CSS para ocultar o cursor (`cursor: none;`) quando o mouse estiver sobre a página.
4.  **Implementar Atualizações em Tempo Real:**
    - Garantir que, ao receber um evento `level:up`, o componente `LiveStage` busque as informações do novo nível e renderize as novas camadas, aplicando o efeito de transição definido (`visualConfig.transitionEffect`).
    - Fazer o mesmo para eventos especiais (`event:triggered`), adicionando e removendo camadas temporárias.
5.  **Criar Página de Instruções (Opcional, mas recomendado):**
    - Criar uma seção na UI (talvez na página de Configurações) ou um arquivo `docs/OBS_SETUP.md` explicando passo a passo como adicionar a URL `http://localhost:5173/live` como uma fonte de navegador no OBS.
6.  **Adicionar Atalhos de Teclado (Hotkeys):**
    - Implementar um hook `useHotkeys` para permitir, por exemplo, que a tecla `F` ative o modo tela cheia do navegador (kiosk mode).

### Alterações/Arquivos
- `/src/client/App.tsx` (atualizado com a nova rota)
- `/src/client/pages/LiveStage.tsx`
- `/src/client/styles/globals.css` (atualizado com estilos de tela cheia)
- `/src/client/hooks/useHotkeys.ts` (opcional)
- `/docs/OBS_SETUP.md` (opcional)
- `/plans/04-web-live.md`

### Critérios de aceite
- [ ] Acessar a rota `/live` exibe a cena visual do nível 1 (padrão) em tela cheia.
- [ ] O cursor do mouse fica invisível sobre a página `/live`.
- [ ] Forçar um evento de `level:up` no painel de controle faz com que a página `/live` transicione suavemente para a cena do nível 2.
- [ ] A página não apresenta barras de rolagem ou outros elementos de UI, apenas a cena renderizada.

### Riscos/Rollback
- **Risco:** Problemas de performance ao renderizar animações ou vídeos em tela cheia, causando queda de FPS na captura do OBS.
- **Rollback:** Simplificar as cenas, usando imagens estáticas em vez de vídeos ou animações CSS complexas. Remover os efeitos de transição, trocando as cenas instantaneamente.

### Prompt para Claude Code
```
Leia este plano (./04-web-live.md) e execute os Passos em ordem. Ao finalizar, valide os Critérios de aceite e reporte o status de cada item.
```
