# 📝 Módulo Level Editor - Documentação Completa

**Status:** ✅ Concluído e Fechado
**Data de Conclusão:** 31 de Outubro de 2025
**Versão:** 1.1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Arquitetura](#arquitetura)
4. [Estrutura de Dados](#estrutura-de-dados)
5. [Componentes](#componentes)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Guia de Uso](#guia-de-uso)
8. [Referência Técnica](#referência-técnica)

---

## 🎯 Visão Geral

O **Level Editor** é o módulo central para criação e gerenciamento de níveis no sistema Level Up Live. Permite ao streamer criar experiências visuais progressivas com camadas sobrepostas, sons de transição e configurações personalizadas.

### Objetivo

Fornecer uma interface visual completa para:
- Criar e editar níveis de progressão
- Gerenciar camadas visuais com posicionamento e escala
- Configurar sons de transição
- Definir thresholds de XP
- Visualizar preview em tempo real (1920x1080)

### Características Principais

- ✅ **Sistema de Camadas Dinâmico** - Adicione quantas camadas quiser, sem limitações
- ✅ **Controles de Transformação** - Ajuste posição X/Y e escala de cada camada
- ✅ **Preview em Tempo Real** - Visualização 16:9 (1920x1080) com overlay de camadas
- ✅ **Asset Picker Organizado** - Navegação por pastas (backgrounds, artistas, etc)
- ✅ **Drag & Drop** - Reordenação de camadas e níveis
- ✅ **Persistência PostgreSQL** - Dados armazenados com JSONB para flexibilidade
- ✅ **Interface em Português (PT-BR)** - Totalmente traduzido

---

## 🚀 Funcionalidades

### 1. Gerenciamento de Níveis

#### Lista de Níveis (Sidebar)
- Visualização hierárquica com ordem automática
- Indicadores visuais: XP threshold, número de camadas
- Botão "Criar Novo Nível"
- Drag & drop para reordenar níveis

#### Editor Principal
Interface com 4 abas principais:

**Aba Visual:**
- Gerenciador de camadas dinâmico
- Adicionar/remover camadas
- Asset picker com pastas organizadas
- Controles de posição (X, Y em pixels)
- Controles de escala (10-300%)
- Botão reset para valores padrão
- Drag & drop para reordenar camadas

**Aba Sons:**
- Som de transição (ao subir de nível)
- Som de level up (celebração)
- Som ambiente (opcional, loop)
- Seletor de arquivos de áudio

**Aba Configuração:**
- **Informações Básicas:**
  - Nome do nível (obrigatório)
  - Descrição (opcional)
- **Progressão e XP:**
  - XP Necessário (threshold)
  - Ordem (automático, não editável)
- **Efeitos Visuais:**
  - Duração da transição (100-3000ms, slider)
  - Tipo de transição (fade, slide, zoom)
  - Preview em tempo real

**Aba Eventos:**
- Placeholder para eventos futuros

### 2. Preview Live (1920x1080)

- Proporção 16:9 fixa
- Renderização de todas as camadas com z-index
- Aplicação de transformações CSS em tempo real
- Indicadores: Nível, XP, Número de camadas
- Badge "Não salvo" quando há mudanças pendentes

### 3. Sistema de Transformação de Camadas

Cada camada pode ser ajustada individualmente:

```typescript
interface LayerTransform {
  path: string;        // Caminho do asset
  x: number;           // Posição X em pixels (0 = esquerda)
  y: number;           // Posição Y em pixels (0 = topo)
  scale: number;       // Escala (1 = 100%, 0.5 = 50%, 2 = 200%)
  rotation?: number;   // Rotação em graus (futuro)
  opacity?: number;    // Opacidade 0-1 (futuro)
}
```

**Controles de Transformação:**
- Toggle com ícone maximize para expandir/recolher
- Input numérico para X (step: 10px)
- Input numérico para Y (step: 10px)
- Slider de escala (10-300%) + input numérico
- Botão "Resetar Posição e Escala"

**Renderização no Preview:**
```css
transform: translate(Xpx, Ypx) scale(factor);
transition: transform 0.2s ease-out;
```

---

## 🏗️ Arquitetura

### Stack Tecnológica

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- @dnd-kit (drag & drop)
- Lucide React (ícones)

**Backend:**
- Node.js + Express
- PostgreSQL 16 (Docker)
- TypeScript

**Comunicação:**
- REST API (CRUD operations)
- Socket.IO (futuro: real-time updates)

### Estrutura de Pastas

```
src/
├── client/
│   └── src/
│       ├── pages/
│       │   └── LevelEditor.tsx          # Página principal
│       ├── components/
│       │   └── level/
│       │       ├── LevelForm.tsx        # Formulário com abas
│       │       ├── LevelList.tsx        # Sidebar com níveis
│       │       ├── LevelItem.tsx        # Item da lista
│       │       ├── LayerManager.tsx     # Gerenciador de camadas
│       │       ├── LayerItem.tsx        # Item de camada (com controles)
│       │       ├── AssetPicker.tsx      # Seletor de assets
│       │       ├── SoundPicker.tsx      # Seletor de sons
│       │       └── LivePreview.tsx      # Preview 16:9
│       └── hooks/
│           └── useLevels.ts             # Hook de estado
├── server/
│   ├── controllers/
│   │   ├── LevelController.ts           # Rotas REST
│   │   └── AssetController.ts           # Assets estáticos
│   ├── services/
│   │   └── LevelService.ts              # Lógica de negócio
│   └── database/
│       └── repositories/
│           └── LevelRepository.ts       # Acesso aos dados
└── shared/
    └── types.ts                          # Tipos compartilhados
```

---

## 📊 Estrutura de Dados

### Tipo Level (TypeScript)

```typescript
interface Level {
  id: string;                    // UUID
  order: number;                 // Ordem na lista (1, 2, 3...)
  name: string;                  // Nome do nível
  description: string;           // Descrição opcional
  xpThreshold: number;           // XP total necessário
  layers: {
    background: string;          // Não usado (legado)
    stage: string;               // Não usado (legado)
    crowd: string;               // Não usado (legado)
    effects: LayerTransform[];   // Array de camadas dinâmicas
  };
  sounds: {
    transition: string;          // Som de transição
    levelUp: string;             // Som de level up
    ambient?: string;            // Som ambiente (opcional)
  };
  visualConfig: {
    transitionDuration: number;  // Duração em ms
    transitionEffect: 'fade' | 'slide' | 'zoom';
  };
  availableEvents: string[];     // IDs de eventos (futuro)
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}

interface LayerTransform {
  path: string;                  // assets/imagens/backgrounds/bg.png
  x: number;                     // Posição X (0 = centro)
  y: number;                     // Posição Y (0 = centro)
  scale: number;                 // Escala (1 = 100%)
  rotation?: number;             // Rotação (opcional)
  opacity?: number;              // Opacidade (opcional)
}
```

### Tabela PostgreSQL

```sql
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_num INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  xp_threshold INTEGER NOT NULL DEFAULT 0,
  layers_json JSONB NOT NULL DEFAULT '{"background":"","stage":"","crowd":"","effects":[]}',
  sounds_json JSONB NOT NULL DEFAULT '{"transition":"","levelUp":""}',
  visual_config_json JSONB NOT NULL DEFAULT '{"transitionDuration":500,"transitionEffect":"fade"}',
  available_events_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_levels_order ON levels(order_num);
```

**Migração Automática:**

O sistema detecta automaticamente layers no formato antigo (string array) e converte para `LayerTransform[]`:

```typescript
// Formato antigo (string[])
effects: ["assets/bg.png", "assets/artist.png"]

// Formato novo (LayerTransform[])
effects: [
  { path: "assets/bg.png", x: 0, y: 0, scale: 1, opacity: 1 },
  { path: "assets/artist.png", x: 0, y: 0, scale: 1, opacity: 1 }
]
```

---

## 🎨 Componentes

### 1. LevelEditor (Página Principal)

**Localização:** `src/client/src/pages/LevelEditor.tsx`

**Responsabilidades:**
- Layout 2 colunas (sidebar + editor)
- Gerenciamento de estado global da página
- Notificações toast (sucesso/erro)
- Controle de nível selecionado

**Estado:**
```typescript
const [levels, setLevels] = useState<Level[]>([])
const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null)
const [toastMessage, setToastMessage] = useState<{type, text} | null>(null)
```

**Handlers:**
- `handleCreateLevel()` - Cria novo nível com valores padrão
- `handleSaveLevel()` - Salva alterações via API
- `handleDeleteLevel()` - Deleta nível com confirmação
- `handleReorderLevels()` - Reordena via drag & drop

---

### 2. LevelForm (Formulário com Abas)

**Localização:** `src/client/src/components/level/LevelForm.tsx`

**Responsabilidades:**
- Abas: Visual, Sons, Configuração, Eventos
- Formulário controlado com `isDirty` flag
- Preview em tempo real
- Validação e persistência
- **Sincronização automática ao trocar de nível**

**Props:**
```typescript
interface LevelFormProps {
  level: Level;
  onSave: (level: Level) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  isSaving?: boolean;
}
```

**Sincronização de Estado:**
```typescript
// Atualiza formData quando level.id muda (seleção de outro nível)
useEffect(() => {
  setFormData(sanitizedLevel)
  setIsDirty(false)
  setActiveTab('visual') // Reset para aba Visual
}, [level.id])
```

**Abas Implementadas:**

**Visual:**
- `<LayerManager>` - Lista de camadas
- `<LivePreview>` - Preview 16:9

**Sons:**
- `<SoundPicker>` - Seletor para transition
- `<SoundPicker>` - Seletor para levelUp
- `<SoundPicker>` - Seletor para ambient (opcional)

**Configuração:**
- Cards organizados por tema:
  - Informações Básicas (ícone documento)
  - Progressão e XP (ícone troféu)
  - Efeitos Visuais (ícone estrelas)
- Labels com ícones
- Campos obrigatórios marcados com *
- Textos de ajuda abaixo dos campos
- Sliders com valores dinâmicos

---

### 3. LayerManager (Gerenciador de Camadas)

**Localização:** `src/client/src/components/level/LayerManager.tsx`

**Responsabilidades:**
- Lista de camadas com drag & drop
- Botão "Adicionar Camada"
- Modal de asset picker inline
- Propagação de mudanças para LevelForm

**Features:**
- Drag & drop com @dnd-kit
- Edição inline de camadas
- Delete com confirmação implícita
- Auto-numeração (Camada 1, Camada 2...)

**Callbacks:**
```typescript
onLayersUpdate?: (level: Level) => void
onLayerSelect?: (layerId: string) => void
```

---

### 4. LayerItem (Item de Camada)

**Localização:** `src/client/src/components/level/LayerItem.tsx`

**Responsabilidades:**
- Thumbnail da imagem
- Drag handle (6 pontos)
- Botões: Transformação, Visibilidade, Editar, Deletar
- Painel de controles de transformação (expansível)

**Controles de Transformação:**
```tsx
{showControls && (
  <div className="transform-panel">
    <input
      type="number"
      value={x}
      onChange={handleXChange}
      className="bg-[#0F0A1E] border border-primary-700 text-primary-100"
      step="10"
    />
    <input
      type="number"
      value={y}
      onChange={handleYChange}
      className="bg-[#0F0A1E] border border-primary-700 text-primary-100"
      step="10"
    />
    <input type="range" min="10" max="300" value={scale * 100} />
    <input
      type="number"
      value={scale * 100}
      className="bg-[#0F0A1E] border border-primary-700 text-primary-100"
    />
    <button onClick={handleReset}>Resetar</button>
  </div>
)}
```

**Props:**
```typescript
interface LayerItemProps {
  id: string;
  name: string;
  imagePath?: string;
  transform?: LayerTransform;
  visible?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onVisibilityToggle?: () => void;
  onTransformChange?: (transform: Partial<LayerTransform>) => void;
  isDragging?: boolean;
  isSelected?: boolean;
}
```

---

### 5. LivePreview (Preview 16:9)

**Localização:** `src/client/src/components/level/LivePreview.tsx`

**Responsabilidades:**
- Container com aspect ratio 16:9 fixo (1920x1080)
- Renderização de camadas com z-index
- Aplicação de transformações CSS **EXATAMENTE** iguais à Live View (8020)
- Fallback para "Nenhuma camada configurada"

**Rendering:**
```tsx
<div style={{ paddingBottom: '56.25%' }}> {/* 16:9 */}
  <div className="absolute inset-0">
    {layers.map((layer, idx) => (
      <div
        key={layer.id}
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 + idx }}
      >
        <img
          src={`/${layer.path}`}
          style={{
            position: 'relative',
            transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale})`,
            opacity: layer.opacity ?? 1,
            transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
          }}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    ))}
  </div>
</div>
```

**Sincronização com Live View (8020):**
O preview no editor aplica **exatamente** as mesmas transformações CSS que a página Live View (`/src/server/views/live-view.html`) para garantir que o streamer veja exatamente o que será exibido no OBS.

**Info Cards:**
- Número de camadas
- Tipo de transição
- Status de seleção

---

### 6. AssetPicker (Seletor de Assets)

**Localização:** `src/client/src/components/level/AssetPicker.tsx`

**Responsabilidades:**
- Listar assets por pasta
- Filtrar por tipo (images, scenes, artists, sounds)
- Thumbnail preview
- Callback de seleção

**Endpoint:**
```
GET /api/assets/images
```

**Response:**
```json
{
  "backgrounds": [
    "assets/imagens/backgrounds/background.png"
  ],
  "artistas": [
    "assets/imagens/artistas/vocal-cantando.png",
    "assets/imagens/artistas/vocal-pulando.png",
    "assets/imagens/artistas/vocal-agradecendo.png"
  ]
}
```

**Props:**
```typescript
interface AssetPickerProps {
  type: 'images' | 'scenes' | 'artists' | 'sounds';
  currentValue?: string;
  onSelect: (path: string) => void;
}
```

---

## 🔄 Fluxo de Dados

### 1. Carregamento Inicial

```
User → LevelEditor
  └→ useEffect
      └→ fetch('/api/levels')
          └→ LevelController.getAllLevels()
              └→ LevelService.getAllLevels()
                  └→ LevelRepository.getAllLevels()
                      └→ PostgreSQL
                          └→ mapRowToLevel() [migração automática]
                              └→ Response → setLevels()
```

### 2. Criar Novo Nível

```
User → Click "Criar Novo Nível"
  └→ handleCreateLevel()
      └→ POST /api/levels
          └→ LevelController.createLevel()
              └→ LevelService.createLevel()
                  └→ LevelRepository.createLevel()
                      └→ INSERT INTO levels
                          └→ Response → setLevels([...levels, newLevel])
                              └→ setSelectedLevelId(newLevel.id)
```

### 3. Adicionar Camada

```
User → Click "Adicionar Camada"
  └→ LayerManager.handleAddEffect()
      └→ setShowAssetPicker(true)
          └→ User selects image
              └→ handleAddEffectImage(imagePath)
                  └→ Create LayerTransform { path, x: 0, y: 0, scale: 1 }
                      └→ onLayersUpdate(updatedLevel)
                          └→ LevelForm.handleFormChange({ layers })
                              └→ setFormData({ ...prev, layers })
                              └→ setIsDirty(true)
```

### 4. Ajustar Transformação

```
User → Click maximize icon
  └→ LayerItem.setShowControls(true)
      └→ User changes X position
          └→ onTransformChange({ x: newValue })
              └→ LayerManager.handleLayerTransformChange(layerId, { x })
                  └→ Update effects[idx] with new x
                      └→ onLayersUpdate(updatedLevel)
                          └→ LevelForm.handleFormChange({ layers })
                              └→ LivePreview re-renders with new transform
```

### 5. Salvar Nível

```
User → Click "Salvar"
  └→ LevelForm.handleSave()
      └→ onSave(formData)
          └→ LevelEditor.handleSaveLevel()
              └→ PUT /api/levels/:id
                  └→ LevelController.updateLevel()
                      └→ LevelService.updateLevel()
                          └→ LevelRepository.updateLevel()
                              └→ UPDATE levels SET ... WHERE id = $1
                                  └→ Response → setIsDirty(false)
                                      └→ Toast success
```

### 6. Reordenar Níveis (Drag & Drop)

```
User → Drag level to new position
  └→ LevelList.handleDragEnd(event)
      └→ arrayMove(levels, oldIndex, newIndex)
          └→ onReorder(reorderedIds)
              └→ LevelEditor.handleReorderLevels()
                  └→ PUT /api/levels/reorder
                      └→ LevelController.reorderLevels()
                          └→ LevelService.reorderLevels()
                              └→ Transaction: UPDATE order_num
                                  └→ Response → setLevels(reordered)
```

---

## 📖 Guia de Uso

### Criar um Novo Nível

1. Abra **Level Editor** no menu lateral
2. Click em **"Criar Novo Nível"** na sidebar
3. O novo nível aparece na lista e abre automaticamente

### Adicionar Camadas Visuais

1. Na aba **Visual**, click **"Adicionar Camada"**
2. Selecione uma imagem da lista organizada por pastas
3. A camada aparece na lista com thumbnail
4. Para adicionar mais camadas, repita o processo

### Ajustar Posição e Escala

1. Passe o mouse sobre a camada desejada
2. Click no ícone de **maximize** (4º botão)
3. Ajuste os valores:
   - **Posição X**: Movimento horizontal (-∞ a +∞ pixels)
   - **Posição Y**: Movimento vertical (-∞ a +∞ pixels)
   - **Escala**: Tamanho (10% a 300%)
4. Veja as mudanças em tempo real no preview abaixo
5. Click **"Resetar"** para voltar aos valores padrão (0, 0, 100%)

### Reordenar Camadas (Z-Index)

1. Arraste a camada pela handle (6 pontos)
2. Solte na nova posição
3. A ordem define o z-index (primeira = fundo, última = frente)

### Configurar Sons

1. Vá para a aba **Sons**
2. Selecione:
   - **Som de Transição**: Toca ao iniciar transição
   - **Som de Level Up**: Toca ao completar level up
   - **Som Ambiente**: Loop contínuo (opcional)

### Configurar Progressão

1. Vá para a aba **Configuração**
2. Preencha:
   - **Nome**: Identificação do nível (ex: "Garagem", "Arena")
   - **Descrição**: Notas internas (opcional)
   - **XP Necessário**: Total de XP para alcançar este nível
3. Ajuste efeitos visuais:
   - **Duração**: Tempo da transição (slider 100-3000ms)
   - **Tipo**: Fade, Slide ou Zoom

### Salvar Alterações

1. Faça suas modificações
2. Observe o badge **"Não salvo"** no preview
3. Click em **"Salvar"** no rodapé
4. Aguarde confirmação "Nível salvo com sucesso"

### Deletar Nível

1. Selecione o nível
2. Click no ícone de **lixeira** (vermelho) no rodapé
3. Confirme a ação (irreversível)

### Reordenar Níveis

1. Na sidebar, arraste um nível pela área inteira do card
2. Solte na nova posição
3. A ordem é salva automaticamente

---

## 🔧 Referência Técnica

### Endpoints REST API

#### GET `/api/levels`
Retorna todos os níveis ordenados por `order_num`.

**Response:**
```json
[
  {
    "id": "uuid",
    "order": 1,
    "name": "Garagem",
    "description": "Nível inicial",
    "xpThreshold": 0,
    "layers": {
      "background": "",
      "stage": "",
      "crowd": "",
      "effects": [
        {
          "path": "assets/imagens/backgrounds/background.png",
          "x": 0,
          "y": 0,
          "scale": 1,
          "opacity": 1
        }
      ]
    },
    "sounds": {
      "transition": "",
      "levelUp": ""
    },
    "visualConfig": {
      "transitionDuration": 500,
      "transitionEffect": "fade"
    },
    "availableEvents": [],
    "createdAt": "2025-10-30T...",
    "updatedAt": "2025-10-30T..."
  }
]
```

#### GET `/api/levels/:id`
Retorna um nível específico por ID.

#### POST `/api/levels`
Cria um novo nível.

**Request Body:**
```json
{
  "name": "Novo Nível",
  "description": "Descrição",
  "xpThreshold": 100
}
```

**Response:** Level object criado

#### PUT `/api/levels/:id`
Atualiza um nível existente.

**Request Body:** Level object completo

**Response:** Level object atualizado

#### DELETE `/api/levels/:id`
Deleta um nível.

**Response:** 204 No Content

#### PUT `/api/levels/reorder`
Reordena múltiplos níveis.

**Request Body:**
```json
{
  "levelIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** 200 OK

#### GET `/api/assets/images`
Retorna assets organizados por pasta.

**Response:**
```json
{
  "backgrounds": ["assets/imagens/backgrounds/bg.png"],
  "artistas": ["assets/imagens/artistas/vocal.png"]
}
```

### Hooks Customizados

#### `useLevels()`

**Localização:** `src/client/src/hooks/useLevels.ts`

**Retorno:**
```typescript
{
  levels: Level[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createLevel: (data) => Promise<Level>;
  updateLevel: (id, data) => Promise<Level>;
  deleteLevel: (id) => Promise<void>;
  reorderLevels: (ids) => Promise<void>;
}
```

**Uso:**
```typescript
const { levels, createLevel, updateLevel } = useLevels()

const handleCreate = async () => {
  const newLevel = await createLevel({
    name: 'Nível 1',
    description: 'Teste',
    xpThreshold: 100
  })
}
```

### Validação

**LevelService.validateLevel():**
```typescript
validateLevel(level: Level): string[] {
  const errors: string[] = []

  if (!level.name || level.name.trim() === '') {
    errors.push('Level name is required')
  }

  if (level.order < 1) {
    errors.push('Level order must be >= 1')
  }

  if (level.xpThreshold < 0) {
    errors.push('XP threshold must be >= 0')
  }

  return errors
}
```

### Migração Automática de Dados

**LevelRepository.migrateEffectsArray():**

Converte automaticamente layers antigas (string[]) para novo formato (LayerTransform[]):

```typescript
private migrateEffectsArray(effects: any[]): LayerTransform[] {
  return effects.map((effect: any) => {
    // Se já é LayerTransform, retorna com defaults
    if (typeof effect === 'object' && 'path' in effect) {
      return {
        path: effect.path,
        x: effect.x ?? 0,
        y: effect.y ?? 0,
        scale: effect.scale ?? 1,
        rotation: effect.rotation,
        opacity: effect.opacity ?? 1,
      }
    }

    // Se é string (formato antigo), converte
    if (typeof effect === 'string') {
      return {
        path: effect,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
      }
    }

    // Fallback
    return {
      path: '',
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
    }
  })
}
```

---

## 📦 Dependências

### Principais

```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@dnd-kit/core": "^6.0.8",
  "@dnd-kit/sortable": "^7.0.2",
  "@dnd-kit/utilities": "^3.2.1",
  "lucide-react": "^0.263.1",
  "tailwindcss": "^3.3.0",
  "pg": "^8.11.0",
  "express": "^4.18.2"
}
```

### DevDependencies

```json
{
  "@types/react": "^18.2.0",
  "@types/pg": "^8.10.0",
  "@types/express": "^4.17.0"
}
```

---

## 🎨 Design System

### Cores (Tailwind Config)

```typescript
colors: {
  primary: {
    100: '#F3E8FF',  // Texto claro
    200: '#E9D5FF',  // Labels
    400: '#C4B5FD',  // Ícones
    500: '#8B5CF6',  // Roxo principal
    600: '#7C3AED',  // Hover
    800: '#5B21B6',  // Bordas
  },
  surface: {
    dark: '#0F0A1E',     // Fundo escuro
    light: '#1A1332',    // Cards
    lighter: '#2D1B4E',  // Hover
  },
  accent: {
    pink: '#EC4899',     // Destaques rosa
    indigo: '#6366F1',   // Destaques azul
  },
}
```

### Componentes UI

Baseado em **shadcn/ui** com customizações:
- Inputs com focus ring colorido
- Sliders customizados
- Select com dropdown estilizado
- Cards com ícones temáticos
- Badges informativos

---

## 🐛 Troubleshooting

### Problema: Não consigo selecionar outro nível sem recarregar

**Causa:** `useState` inicial não atualiza quando prop `level` muda.

**Solução:** ✅ **Corrigido na v1.1.0** - Adicionado `useEffect` que monitora `level.id`:
```typescript
useEffect(() => {
  setFormData(sanitizedLevel)
  setIsDirty(false)
  setActiveTab('visual')
}, [level.id])
```

### Problema: Inputs de posição/escala com fundo branco

**Causa:** Classe Tailwind não aplicada corretamente.

**Solução:** ✅ **Corrigido na v1.1.0** - Usar cor hex direta:
```typescript
className="bg-[#0F0A1E] border border-primary-700 text-primary-100"
```

### Problema: Live View (8020) não igual ao Preview do editor

**Causa:** CSS de renderização diferente entre componentes.

**Solução:** ✅ **Corrigido na v1.1.0** - Sincronizar transformações CSS:
```css
/* LivePreview.tsx e live-view.html */
transform: translate(${x}px, ${y}px) scale(${scale});
object-fit: contain;
```

### Problema: Placeholder não visível

**Causa:** Classe `bg-surface-darker` não existe no Tailwind config.

**Solução:** Usar `bg-surface-dark` (definida no config).

### Problema: Imagens não carregam (404)

**Causa:** Vite dev server não proxying `/assets`.

**Solução:** Adicionar proxy no `vite.config.ts`:
```typescript
proxy: {
  '/assets': {
    target: 'http://localhost:8881',
    changeOrigin: true
  }
}
```

### Problema: Apenas uma camada visível

**Causa:** `object-cover` preenche todo container.

**Solução:** Usar `object-contain` com `absolute inset-0` e z-index.

### Problema: Botões não clicáveis (drag handle)

**Causa:** `{...attributes} {...listeners}` aplicado ao elemento raiz.

**Solução:** Mover para elemento específico do drag handle:
```tsx
<div>
  <div {...attributes} {...listeners}>Drag Handle</div>
  <button onClick={handleEdit}>Edit</button>
</div>
```

### Problema: Erro "invalid input syntax for type integer: NaN"

**Causa:** Chamada assíncrona sem `await`.

**Solução:** Converter service/controller para `async/await`:
```typescript
// ERRADO
const levels = this.getAllLevels()
const order = levels.length + 1  // undefined.length = NaN

// CORRETO
const levels = await this.getAllLevels()
const order = levels.length + 1  // Funciona
```

---

## ✅ Checklist de Conclusão

- [x] Interface visual completa (4 abas)
- [x] Sistema de camadas dinâmico
- [x] Controles de transformação (X, Y, escala)
- [x] Preview em tempo real (1920x1080)
- [x] Asset picker organizado por pastas
- [x] Drag & drop de camadas
- [x] Drag & drop de níveis
- [x] Persistência PostgreSQL
- [x] Migração automática de dados antigos
- [x] Validação de formulário
- [x] Notificações toast
- [x] Tradução PT-BR completa
- [x] Documentação técnica
- [x] Guia de uso
- [x] Tratamento de erros
- [x] Design system consistente

---

## 📝 Notas de Versão

### v1.1.0 (31/10/2025)

**Correções Importantes:**
- ✅ **Fix: Seleção de níveis** - Agora é possível selecionar diferentes níveis sem recarregar a página
  - Adicionado `useEffect` que sincroniza `formData` quando `level.id` muda
  - Reseta `isDirty` e volta para aba Visual ao trocar de nível
- ✅ **Fix: Tema dark nos inputs** - Campos de posição X/Y e escala agora usam `bg-[#0F0A1E]` (fundo escuro)
- ✅ **Fix: Live View (8020)** - Renderização agora é idêntica ao Preview do editor
  - Container usa `100vw x 100vh` para preencher viewport do OBS
  - Transformações CSS sincronizadas: `translate(x, y) scale(s)`
  - `object-fit: contain` para manter proporções

**Melhorias de UX:**
- Preview Live e Live View (8020) agora renderizam de forma idêntica
- Inputs de transformação seguem o design system escuro
- Troca entre níveis é instantânea e fluida

---

### v1.0.0 (30/10/2025)

**Recursos Implementados:**
- Editor visual completo com 4 abas
- Sistema de camadas com transformações (posição + escala)
- Preview 16:9 em tempo real
- Asset picker com navegação por pastas
- Seletor de sons para transições
- Configuração de XP e efeitos visuais
- Drag & drop para reordenação
- Persistência com PostgreSQL + JSONB
- Migração automática de dados legados
- Interface totalmente em português

**Breaking Changes:**
- `Level.layers.effects` mudou de `string[]` para `LayerTransform[]`
- Migração automática aplicada no carregamento

**Melhorias de UX:**
- Cards temáticos com ícones na aba Configuração
- Sliders visuais para duração de transição
- Badges informativos (AUTO, XP, etc)
- Placeholders descritivos
- Focus rings coloridos
- Textos de ajuda contextuais

---

## 🔮 Próximos Passos (Futuro)

### Features Planejadas

1. **Aba Eventos** - Sistema completo de eventos
2. **Rotation Control** - Rotação de camadas
3. **Opacity Control** - Transparência de camadas
4. **Animation Presets** - Animações pré-definidas
5. **Snap to Grid** - Alinhamento em grid
6. **Undo/Redo** - Histórico de alterações
7. **Duplicate Level** - Clonar níveis existentes
8. **Export/Import** - Backup de configurações
9. **Templates** - Níveis pré-configurados
10. **Hotkeys** - Atalhos de teclado

### Melhorias Técnicas

- [ ] WebSocket real-time sync
- [ ] Optimistic UI updates
- [ ] Image lazy loading
- [ ] Virtual scrolling para muitas camadas
- [ ] Asset upload direto pela interface
- [ ] Crop/resize de imagens
- [ ] Color picker para overlays
- [ ] Filtros CSS (blur, brightness, etc)

---

## 📞 Suporte

**Documentação:** `docs/LEVEL_EDITOR_MODULE.md`
**PRD Completo:** `docs/PRD.md`
**Types:** `src/shared/types.ts`
**Exemplo de Uso:** Veja código em `src/client/src/pages/LevelEditor.tsx`

---

## 📜 Licença

Este módulo faz parte do projeto **Level Up Live** e segue a mesma licença do projeto principal.

---

**Módulo Level Editor - Concluído com Sucesso! 🎉**
