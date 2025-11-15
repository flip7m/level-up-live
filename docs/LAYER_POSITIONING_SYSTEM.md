# Layer Positioning System

## Overview

O sistema de posicionamento de layers permite que você adicione imagens/vídeos ao editor de level e posicione-os precisamente usando X, Y, Scale, e Opacity. As posições são mantidas em resolução **1920x1080** (padrão OBS), mas o editor é **responsivo** para se adaptar ao tamanho da tela.

## Architecture

### 1. Editor (LivePreview.tsx) - Responsive
- Container responsivo que se adapta ao tamanho disponível
- Mantém aspecto ratio **16:9** (proporção OBS)
- Coordenadas internas sempre em **1920x1080**
- Escala calculada dinamicamente: `scale = containerWidth / 1920`
- Imagens são posicionadas com X, Y escalados proporcionalmente

**Fórmulas:**
```typescript
left = x * scale          // X original * escala atual
top = y * scale           // Y original * escala atual
transform = `scale(${layerScale})`  // Scale original
```

**Exemplo:**
- Editor tem largura 960px (metade de 1920)
- Scale = 960 / 1920 = 0.5
- Layer com X=100 aparece em: 100 * 0.5 = 50px

### 2. Live View (live-view.html) - Exato 1920x1080
- Container fixo em **1920x1080** (exatamente como OBS captura)
- Posições aplicadas diretamente em pixels
- Sem escala responsiva - é o "canvas real"

**Estrutura:**
```html
<div id="scene-container" style="width: 1920px; height: 1080px;">
  <div style="transform: translate(${x}px, ${y}px) scale(${scale});">
    <img/> ou <video/>
  </div>
</div>
```

## Data Flow

### Adicionando uma Layer

```
Frontend (LayerManager)
  ↓
Cria LayerTransform: { path, x: 0, y: 0, scale: 1, opacity: 1 }
  ↓
API PUT /api/levels/{id}
  ↓
Backend (LevelRepository)
  ↓
PostgreSQL: layers_json = JSON.stringify({ effects: [LayerTransform, ...] })
```

### Editando Posição

```
Frontend (LayerItem Input)
  ↓
onChange: { x: 100, y: 200 }
  ↓
LayerManager.handleLayerTransformChange()
  ↓
API PUT /api/levels/{id}
  ↓
Backend atualiza layers_json
  ↓
LivePreview recalcula (x * scale, y * scale)
  ↓
Live View recebe dados e renderiza (x, y direto)
```

## Layer Transform Interface

```typescript
interface LayerTransform {
  path: string;              // "assets/imagens/backgrounds/bg.png"
  x: number;                 // Posição X em pixels (0-1920)
  y: number;                 // Posição Y em pixels (0-1080)
  scale: number;             // Fator de escala (1 = 100%, 0.5 = 50%)
  rotation?: number;         // Rotação em graus (opcional)
  opacity?: number;          // Opacidade 0-1 (opcional)
}
```

## LivePreview Responsive Behavior

### Container Sizing
```typescript
<div
  ref={containerRef}
  style={{ aspectRatio: '16 / 9' }}  // Mantém proporção 16:9
/>
```

### Dynamic Scale Calculation
```typescript
const [scale, setScale] = useState(1)

useEffect(() => {
  const handleResize = () => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth
      const newScale = width / 1920  // ← Scale dinâmica
      setScale(newScale)
    }
  }
  // Recalcula quando resize
}, [])
```

### Position Application
```typescript
style={{
  left: `${layer.transform.x * scale}px`,    // X escalado
  top: `${layer.transform.y * scale}px`,     // Y escalado
  transform: `scale(${layer.transform.scale})`,  // Scale original
  transformOrigin: '0 0',                     // Escala do canto superior esquerdo
}}
```

## Live View Rendering

### Exato 1920x1080
```javascript
const layerDiv = document.createElement('div')
layerDiv.style.position = 'absolute'
layerDiv.style.left = '0'
layerDiv.style.top = '0'
layerDiv.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
layerDiv.style.transformOrigin = '0 0'
layerDiv.style.opacity = opacity
```

### Coordenadas Diretas
- X, Y são aplicados direto em pixels
- Sem escala responsiva
- É o "canvas real" de 1920x1080

## Synchronization Between Editor and Live View

| Aspecto | Editor | Live View |
|---------|--------|-----------|
| **Resolução** | Responsiva (% de 1920) | Exata 1920x1080 |
| **Container** | `width: 100%`, `aspectRatio: 16/9` | `width: 1920px`, `height: 1080px` |
| **Scale Cálculo** | `width / 1920` | N/A (direto 1920x1080) |
| **Posição X** | `x * scale` | `x` (direto) |
| **Posição Y** | `y * scale` | `y` (direto) |
| **Transform** | `scale(layerScale)` | `scale(layerScale)` |
| **transformOrigin** | `'0 0'` | `'0 0'` |

**Resultado:** Mesma posição visual em ambos os lugares, apenas com zoom diferente no editor.

## Example: Adding and Positioning a Layer

### Step 1: Add Layer
```
Clique em "Adicionar Camada"
→ Selecione imagem (ex: "ajude.png")
→ Cria: { path: "assets/imagens/backgrounds/ajude.png", x: 0, y: 0, scale: 1, opacity: 1 }
```

### Step 2: Edit Position (Editor)
```
LivePreview tem width: 960px
  scale = 960 / 1920 = 0.5

Usuário arrasta imagem para X=100, Y=500

Editor mostra:
  left = 100 * 0.5 = 50px
  top = 500 * 0.5 = 250px
```

### Step 3: Save to Database
```
API PUT /api/levels/uuid-123
{
  layers: {
    effects: [
      { path: "...", x: 100, y: 500, scale: 1, opacity: 1 }
    ]
  }
}
```

### Step 4: Live View Renders
```
Live View recebe x: 100, y: 500
  transform = translate(100px, 500px) scale(1)

Imagem aparece no mesmo lugar (100px, 500px) no canvas 1920x1080
```

## Key Implementation Files

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/client/src/components/level/LivePreview.tsx` | Editor responsivo com cálculo de escala |
| `src/client/src/components/level/LayerManager.tsx` | Adicionar/remover/editar layers |
| `src/client/src/components/level/LayerItem.tsx` | Inputs de X, Y, Scale, Opacity |
| `src/server/views/live-view.html` | Renderização exata 1920x1080 para OBS |
| `src/shared/types.ts` | Interface LayerTransform |

## Transform Origin

Ambos (editor e live view) usam `transformOrigin: '0 0'`:
- Scale começa do **canto superior esquerdo**
- Se layer é 100x100 e X=500, Y=300, scale=2:
  - Corners vão de: (500, 300) a (700, 400)

## Overflow Behavior

### Editor
- `overflow: hidden` no container externo
- Imagens que saem dos limites 16:9 são cortadas
- Mas dá para editar dentro do espaço visual

### Live View
- `overflow: hidden` no scene-container
- Imagens que saem dos limites 1920x1080 são cortadas
- Simula comportamento final em OBS

## Notes

- Todas as coordenadas são em **pixels absolutos**
- Escala responsiva NO EDITOR, não na live view
- Live view é sempre 1920x1080 (padrão OBS)
- Ordem de renderização: Z-index (index do array effects)
- Suporta vídeos e imagens (detecta extensão)
