# Testing Animation System

## Quick Start

### 1. Add Animation Layer to a Level

In the **Level Editor**, to add an animation layer:

```javascript
// Example layer structure (add to level.layers.effects array)
{
  "id": "anim-1",
  "name": "Cantora Aurora - Jump",
  "type": "animation",
  "artistFolder": "cantora-aurora",
  "animationConfig": {
    "default": {
      "name": "idle",
      "fps": 8
    },
    "random": {
      "enabled": false,
      "pool": [],
      "interval": 5000
    }
  },
  "path": "",
  "x": 100,
  "y": 50,
  "scale": 1.2,
  "opacity": 1,
  "zIndex": 10
}
```

### 2. Available Animations for `cantora-aurora`

After placing images, available animations are:
- **idle** - 3 frames @ 8 fps (breathing/standing)
- **jump** - N frames @ 12 fps (jumping animation)

### 3. LivePreview Testing

The `LivePreview` component automatically detects animation layers and renders them using `AnimatedLayer`.

When you add a layer with `type: "animation"`:
1. Frontend loads frames via `useAnimations` hook
2. Frames loaded from: `/assets/imagens/artistas/{artistFolder}/animations/{name}/`
3. AnimatedLayer renders each frame at specified FPS

### 4. Current Status

**Implemented:**
- ✅ AssetRepository - Scans filesystem for frames
- ✅ AssetService - Returns animation metadata
- ✅ AssetController - REST endpoints for animations
- ✅ useAnimations hook - Frontend data loading
- ✅ AnimatedLayer component - Renders frame-by-frame animation
- ✅ LivePreview integration - Detects and renders animations

**Next Steps (Phase 3):**
- AnimationController - State machine for animations
- Random animation rotation
- Triggered animations by events
- Cooldowns between random plays

## File Locations

- Artista: `/assets/imagens/artistas/cantora-aurora/`
- Animations: `/assets/imagens/artistas/cantora-aurora/animations/`
- Frames: `/assets/imagens/artistas/cantora-aurora/animations/{name}/1.png, 2.png, ...`
- Fallback: `/assets/imagens/artistas/cantora-aurora/static.png`

## API Endpoints

```
GET /api/assets/animations
  → Returns complete animation library

GET /api/assets/animations/:artistFolder
  → Returns animations for specific artist

GET /api/assets/animations/:artistFolder/:animationName
  → Returns metadata (frames, fps, duration)

GET /api/assets/animations/:artistFolder/:animationName/frames
  → Returns array of frame paths

GET /api/assets/animations/:artistFolder/:animationName/validate
  → Validates if animation exists

GET /api/assets/animations/:artistFolder/validate-setup
  → Validates artist has required animations (idle + jump)

POST /api/assets/animations/refresh-cache
  → Forces cache refresh (development)
```

## Example: Creating a Test Level with Animations

Add this to your level's `layers.effects`:

```javascript
[
  {
    "type": "image",
    "path": "assets/imagens/backgrounds/stage-1.png",
    "x": 0,
    "y": 0,
    "scale": 1,
    "opacity": 1,
    "zIndex": 1
  },
  {
    "type": "animation",
    "name": "Cantora Jump",
    "artistFolder": "cantora-aurora",
    "animationConfig": {
      "default": {
        "name": "idle",
        "fps": 8
      }
    },
    "x": 500,
    "y": 200,
    "scale": 1,
    "opacity": 1,
    "zIndex": 5
  }
]
```

## Troubleshooting

### Animation not showing?
1. Check browser console for errors
2. Verify artist folder exists: `assets/imagens/artistas/cantora-aurora/`
3. Verify animation folder exists: `assets/imagens/artistas/cantora-aurora/animations/idle/`
4. Verify frames exist: `1.png`, `2.png`, etc.
5. Check that image filenames match (1-indexed, no zero-padding unless > 9)

### Frames loading but not animating?
1. Check FPS value (default 8-12)
2. Check browser console for JavaScript errors
3. Verify AnimationLayerConfig is properly structured

### Performance issues?
1. Reduce FPS (lower = less frequent frame changes)
2. Check browser dev tools for frame drops
3. Monitor memory usage (RequestAnimationFrame loop)

## See Also

- [/plano-editor.md](/plano-editor.md) - Complete project plan
- [src/client/src/hooks/useAnimations.ts](src/client/src/hooks/useAnimations.ts) - Frontend hook
- [src/server/services/AssetService.ts](src/server/services/AssetService.ts) - Backend service
- [src/client/src/components/editor/AnimatedLayer.tsx](src/client/src/components/editor/AnimatedLayer.tsx) - Animation component
