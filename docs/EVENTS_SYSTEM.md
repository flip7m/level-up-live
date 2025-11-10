# Sistema de Eventos - Level Up Live

Documentação completa do sistema de eventos implementado.

## 📋 Visão Geral

O sistema de eventos permite criar experiências visuais e sonoras dinâmicas durante a live, sincronizadas com a progressão de níveis e ações do usuário.

**Status:** ✅ **COMPLETO E FUNCIONAL**

---

## 🎯 Funcionalidades Implementadas

### ✅ Core Features

- **Trigger Manual:** Disparar eventos através de botões no painel de controle
- **Trigger Aleatório:** Sistema sorteia evento disponível baseado em probabilidades
- **Cooldowns:** Controle de tempo entre disparos do mesmo evento
- **Filtros por Nível:** Eventos só aparecem a partir de nível mínimo configurado
- **Múltiplas Layers:** Cada evento pode ter várias camadas visuais sobrepostas
- **Sons Sincronizados:** Reprodução automática de áudio quando evento dispara
- **Animações:** Fade in/out e scale para entrada e saída de eventos
- **Duração Configurável:** Cada evento tem duração específica em segundos
- **Renderização Dupla:** Eventos aparecem tanto no LiveStage (React) quanto Live View (OBS)

### ✅ UI Components

- **EventPanel:** Painel de controle com botões de trigger e lista de eventos ativos
- **Active Events Display:** Mostra eventos em execução com countdown e barra de progresso
- **Cooldown Indicators:** Feedback visual de eventos em cooldown
- **Error Handling:** Mensagens de erro quando evento não pode ser disparado

---

## 📦 Arquitetura do Sistema

### Backend (Já Implementado)

```
src/server/
├── controllers/EventController.ts    # REST endpoints + WebSocket handlers
├── services/EventService.ts          # Lógica de negócio (cooldowns, triggers)
├── database/
│   ├── repositories/EventRepository.ts  # CRUD events no PostgreSQL
│   └── migrations/001_initial_postgres.sql  # Tabela events
└── socket.ts                         # Socket.IO listeners
```

### Frontend (Já Implementado)

```
src/client/src/
├── components/event/EventPanel.tsx   # Painel de controle de eventos
├── hooks/useEvents.ts                # React hook para gerenciar eventos
├── pages/LiveStage.tsx               # Renderização de eventos (React)
└── styles/livestage.css              # Animações CSS de eventos
```

### Live View (OBS Capture)

```
src/server/views/live-view.html
└── JavaScript: Renderização de eventos via Socket.IO
```

---

## 🗄️ Estrutura de Dados

### Event Schema (PostgreSQL)

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,                  -- Nome do evento
  description TEXT,                    -- Descrição
  type TEXT NOT NULL,                  -- 'visual' | 'audio' | 'interactive'
  trigger_type TEXT NOT NULL,          -- 'manual' | 'random' | 'audio'
  trigger_config_json JSONB NOT NULL,  -- Configuração de trigger
  duration INTEGER NOT NULL,           -- Duração em segundos
  assets_json JSONB NOT NULL,          -- Layers e sons
  created_at TIMESTAMP
);
```

### trigger_config_json

```json
{
  "cooldown": 30,        // Segundos entre disparos
  "minLevel": 1,         // Nível mínimo para aparecer
  "probability": 1.0,    // 0.0 - 1.0 (para triggers aleatórios)
  "audioType": "drop"    // 'drop' | 'buildUp' (futuro: triggers automáticos)
}
```

### assets_json

```json
{
  "layers": [
    {
      "id": "uuid",
      "name": "Layer Name",
      "type": "image",
      "order": 100,                     // z-index
      "source": "/assets/events/...",
      "visible": true,
      "transform": {
        "x": 0,
        "y": 0,
        "width": 1920,
        "height": 1080,
        "rotation": 0,
        "opacity": 1.0
      },
      "filters": []
    }
  ],
  "sounds": [
    "/assets/events/confetti/sound.mp3"
  ]
}
```

---

## 🎮 Como Usar

### 1. Disparar Evento Manual

**No Live Control Panel:**

1. Acesse `http://localhost:8882/live-control`
2. No painel "Event Triggers":
   - **Evento Aleatório:** Clique no botão roxo "Evento Aleatório"
   - **Evento Específico:** Selecione no dropdown e clique "Disparar"

**Resultado:**
- Evento aparece no LiveStage e Live View (OBS)
- Som toca automaticamente
- Após duração configurada, evento desaparece com fade-out
- Cooldown ativado (não pode disparar de novo até cooldown expirar)

### 2. Ver Eventos Ativos

No painel "Eventos Ativos" você vê:
- Nome do evento
- Countdown em tempo real
- Barra de progresso
- Tipo de trigger (Manual/Aleatório/Áudio)

### 3. Monitorar em Tempo Real

- **LiveStage:** `http://localhost:8882/live`
- **Live View (OBS):** `http://localhost:8020`

---

## 📊 Eventos Pré-Configurados (Seed)

5 eventos foram criados automaticamente no banco:

### 1. Confetti Explosion
- **Tipo:** Manual
- **Nível Mínimo:** 1
- **Cooldown:** 30 segundos
- **Duração:** 5 segundos
- **Assets:** Confetes coloridos

### 2. Fireworks
- **Tipo:** Audio (build-up) - *Futuro*
- **Nível Mínimo:** 2
- **Cooldown:** 60 segundos
- **Duração:** 8 segundos
- **Probabilidade:** 30%
- **Assets:** Fogos de artifício

### 3. Spotlight Sweep
- **Tipo:** Random
- **Nível Mínimo:** 1
- **Cooldown:** 20 segundos
- **Duração:** 3 segundos
- **Probabilidade:** 50%
- **Assets:** Varredura de holofote

### 4. Crowd Cheer
- **Tipo:** Audio (drop) - *Futuro*
- **Nível Mínimo:** 1
- **Cooldown:** 45 segundos
- **Duração:** 6 segundos
- **Probabilidade:** 40%
- **Assets:** Plateia animada

### 5. Laser Show
- **Tipo:** Manual
- **Nível Mínimo:** 2
- **Cooldown:** 90 segundos
- **Duração:** 10 segundos
- **Assets:** Show de lasers

---

## 🛠️ API Endpoints

### REST API

```http
GET    /api/events                      # Listar todos os eventos
GET    /api/events/available?level=X    # Eventos disponíveis para nível
GET    /api/events/:id                  # Buscar evento por ID
POST   /api/events                      # Criar evento
PUT    /api/events/:id                  # Atualizar evento
DELETE /api/events/:id                  # Deletar evento
POST   /api/events/trigger/:id          # Disparar evento específico
POST   /api/events/trigger-random       # Disparar evento aleatório
POST   /api/events/clear-cooldowns      # Limpar cooldowns (teste)
```

### WebSocket (Socket.IO)

**Client → Server:**
```javascript
socket.emit('event:trigger', { eventId, level })
socket.emit('event:trigger-random', { level })
```

**Server → Client:**
```javascript
socket.on('event:triggered', (data) => {
  // data: { eventId, name, duration, assets, type, triggeredAt }
})

socket.on('event:ended', (data) => {
  // data: { eventId, name, endedAt }
})

socket.on('event:error', (data) => {
  // data: { error: string }
})
```

---

## 🎨 Adicionando Novos Eventos

### Opção 1: Via Banco de Dados Direto

Adicione em `src/server/database/seed.ts`:

```typescript
const newEventId = randomUUID()
await pool.query(
  `INSERT INTO events (
    id, name, description, type, trigger_type,
    trigger_config_json, duration, assets_json, created_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
  [
    newEventId,
    'Meu Evento',
    'Descrição do evento',
    'visual',
    'manual',
    JSON.stringify({ cooldown: 30, minLevel: 1, probability: 1.0 }),
    5,
    JSON.stringify({
      layers: [
        {
          id: randomUUID(),
          name: 'Layer Principal',
          type: 'image',
          order: 100,
          source: '/assets/events/meu-evento/imagem.png',
          visible: true,
          transform: { x: 0, y: 0, width: 1920, height: 1080, rotation: 0, opacity: 1.0 },
          filters: [],
        },
      ],
      sounds: ['/assets/events/meu-evento/som.mp3'],
    }),
    now,
  ]
)
```

Depois rode:
```bash
npm run db:seed
```

### Opção 2: Via API REST

```javascript
fetch('http://localhost:8881/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Meu Evento',
    description: 'Descrição',
    type: 'visual',
    triggerType: 'manual',
    triggerConfig: {
      cooldown: 30,
      minLevel: 1,
      probability: 1.0
    },
    duration: 5,
    assets: {
      layers: [...],
      sounds: [...]
    }
  })
})
```

---

## 📂 Organização de Assets

Estrutura recomendada:

```
assets/events/
├── confetti-explosion/
│   ├── layer1.png          # Imagem do evento
│   ├── sound.mp3           # Som do evento
│   └── README.md           # Documentação
├── fireworks/
│   ├── explosion.png
│   └── sound.mp3
└── meu-evento/
    ├── imagem.png          # 1920x1080 recomendado
    └── som.mp3
```

**Dicas de Assets:**
- **Imagens:** PNG com transparência funcionam melhor
- **Resolução:** 1920x1080 (Full HD) é o padrão
- **Sons:** MP3, curtos (< 5 segundos idealmente)
- **Opacidade:** Use opacity < 1.0 para efeitos sutis

---

## 🔧 Troubleshooting

### Evento não aparece quando disparado

**Causas possíveis:**
1. Arquivo de imagem não existe no caminho especificado
2. Erro no path (verificar barras `/` vs `\`)
3. Nível do jogador menor que `minLevel` do evento
4. Evento em cooldown

**Solução:**
- Verifique console do navegador (F12)
- Verifique logs do servidor (`data/logs/app.log`)
- Teste com evento sem cooldown

### Evento aparece mas sem som

**Causas possíveis:**
1. Arquivo de áudio não existe
2. Browser bloqueou autoplay de áudio
3. Volume baixo

**Solução:**
- Verifique path do arquivo de som
- Interaja com a página antes (clique) para liberar autoplay
- Aumente volume do sistema

### Cooldown não funciona

**Causas possíveis:**
1. Servidor reiniciou (cooldowns em memória são perdidos)
2. Múltiplas instâncias do servidor rodando

**Solução:**
- Rodar `POST /api/events/clear-cooldowns` para resetar
- Verificar se há apenas 1 servidor ativo

---

## 🚀 Próximas Melhorias (Futuro)

**Já planejado mas não implementado:**

1. **Event Editor UI:** Interface visual para criar/editar eventos
2. **Triggers Automáticos por Áudio:** Eventos disparam quando música tem drop/build-up
3. **Cooldowns Persistentes:** Salvar cooldowns no banco (sobrevivem restart)
4. **Múltiplos Eventos Simultâneos:** Suporte a 3+ eventos ativos ao mesmo tempo
5. **Efeitos Avançados:** Particle systems, animações complexas
6. **Sistema de Votação:** Chat vota qual evento disparar (integração Twitch/YouTube)

---

## 📝 Exemplo de Uso Completo

```javascript
// 1. Criar evento via API
const evento = await fetch('http://localhost:8881/api/events', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Explosão de Estrelas',
    type: 'visual',
    triggerType: 'manual',
    duration: 7,
    triggerConfig: { cooldown: 40, minLevel: 1, probability: 1.0 },
    assets: {
      layers: [{
        id: crypto.randomUUID(),
        name: 'Stars',
        type: 'image',
        order: 100,
        source: '/assets/events/stars/explosion.png',
        visible: true,
        transform: { x: 0, y: 0, width: 1920, height: 1080, rotation: 0, opacity: 0.9 }
      }],
      sounds: ['/assets/events/stars/twinkle.mp3']
    }
  })
})

// 2. Disparar via Socket.IO
socket.emit('event:trigger', { eventId: evento.id, level: 1 })

// 3. Escutar resultado
socket.on('event:triggered', (data) => {
  console.log('Evento disparado:', data.name)
})
```

---

## ✅ Checklist de Implementação

- [x] Tabela `events` no PostgreSQL
- [x] EventRepository (CRUD)
- [x] EventService (lógica de cooldowns)
- [x] EventController (REST + WebSocket)
- [x] Socket.IO integration
- [x] useEvents hook (React)
- [x] EventPanel component
- [x] LiveStage event rendering
- [x] Live View HTML event rendering
- [x] Animações CSS de entrada/saída
- [x] Seed com 5 eventos de exemplo
- [x] Sistema de cooldowns em memória
- [x] Filtros por nível mínimo
- [x] Suporte a múltiplas layers por evento
- [x] Reprodução automática de sons

---

## 📚 Referências

- **PRD:** `docs/PRD.md` (seção "Event System Module")
- **Código Backend:** `src/server/controllers/EventController.ts`
- **Código Frontend:** `src/client/src/components/event/EventPanel.tsx`
- **Migrations:** `src/server/database/migrations/001_initial_postgres.sql`
- **Seed:** `src/server/database/seed.ts`

---

**Última atualização:** 2025-01-08
**Status:** Sistema completo e funcional (Nível 2 - Intermediário)
**Versão:** 1.0.0
