---
id: plan-02
title: Sprint 02 – Audio Engine
status: ready
depends_on: [plan-01]
owners: [you]
---

### Objetivo
Implementar o núcleo do sistema de áudio, capaz de tocar músicas e efeitos sonoros simultaneamente, analisar o áudio em tempo real para extrair dados como frequência e energia, e emitir esses dados para o frontend via WebSockets. O objetivo é ter um motor de áudio funcional que servirá de base para os sistemas de XP e eventos visuais.

### Entregáveis
- Serviço de backend (`AudioEngineController`) que gerencia a reprodução de áudio com `Howler.js`.
- Serviço de análise (`AudioAnalyzer`) que utiliza a `Web Audio API` para processar o áudio.
- Emissão de eventos de áudio (`audio:analysis`, `audio:drop-detected`) via Socket.IO.
- Componentes de frontend para visualizar a análise de áudio (ex: barras de frequência).
- Controles básicos de UI para tocar, pausar e trocar de música.

### Passos (execução)
1.  **Instalar Dependências de Áudio:**
    ```bash
    npm install howler @types/howler
    ```
2.  **Criar o `AudioEngineController` (`src/server/controllers/AudioEngineController.ts`):**
    - Implementar a lógica de playback usando `Howler.js` para controlar a música principal e os efeitos sonoros (SFX) em canais separados.
    - Criar métodos para `play`, `pause`, `seek`, `setMusicVolume`, `setSFXVolume`.
3.  **Criar o Serviço `AudioAnalyzer` (`src/server/services/AudioAnalyzer.ts`):**
    - Utilizar a `Web Audio API` (em um ambiente Node que suporte, ou simular para o MVP) para criar um `AnalyserNode`.
    - Implementar funções para extrair `getFrequencyData()` e calcular `getEnergy()`.
    - Implementar um algoritmo básico para `detectDrop()` e `detectBuildUp()` baseado na variação de energia.
4.  **Integrar Análise e Playback:**
    - Conectar o `AudioAnalyzer` ao `AudioEngineController` para que a análise seja feita na faixa de música em reprodução.
5.  **Configurar Emissão via Socket.IO:**
    - No `socket.ts`, criar um loop (`setInterval`) que, enquanto a música estiver tocando, puxe os dados do `AudioAnalyzer` e emita para o cliente via `socket.emit('audio:analysis', { frequencyData, energy })`.
    - Emitir eventos discretos como `audio:drop-detected` quando o `AudioAnalyzer` os identificar.
6.  **Criar Componente de Visualização (`src/client/components/audio/FrequencyBars.tsx`):**
    - Criar um componente React que renderize as barras de frequência usando `<canvas>` ou `<div>`s.
    - Utilizar o hook `useWebSocket` para receber os eventos `audio:analysis` e atualizar o estado do componente.
7.  **Criar Hook `useAudioPlayer` (`src/client/hooks/useAudioPlayer.ts`):**
    - Criar um hook para gerenciar o estado do player no cliente e enviar comandos (play, pause) para o backend via WebSocket.

### Alterações/Arquivos
- `/src/server/controllers/AudioEngineController.ts`
- `/src/server/services/AudioAnalyzer.ts`
- `/src/server/socket.ts` (atualizado)
- `/src/shared/audio.types.ts`
- `/src/client/components/audio/FrequencyBars.tsx`
- `/src/client/components/audio/AudioPlayer.tsx`
- `/src/client/hooks/useAudioPlayer.ts`
- `/plans/02-audio-engine.md`

### Critérios de aceite
- [ ] Ao tocar uma música, o backend emite eventos `audio:analysis` via WebSocket.
- [ ] O componente `FrequencyBars` no frontend reage em tempo real à música que está tocando.
- [ ] É possível controlar o volume da música e dos efeitos sonoros de forma independente.
- [ ] O sistema detecta e loga (ou emite) eventos de `drop` e `build-up` (mesmo que de forma imprecisa inicialmente).

### Riscos/Rollback
- **Risco:** A `Web Audio API` não é nativa no Node.js. A análise pode precisar ser feita no cliente ou usando uma biblioteca de terceiros no backend. Para o MVP, a análise pode ser simplificada ou simulada no backend para não travar o desenvolvimento.
- **Rollback:** Desativar os serviços de análise de áudio e focar apenas no playback, revertendo os commits relacionados ao `AudioAnalyzer` e à visualização no frontend.

### Prompt para Claude Code
```
Leia este plano (./02-audio-engine.md) e execute os Passos em ordem. Ao finalizar, valide os Critérios de aceite e reporte o status de cada item.
```
