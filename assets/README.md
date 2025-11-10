# 🎵 Assets - Pasta de Recursos

Esta pasta contém todos os recursos (assets) do projeto Level Up Live.

## 📁 Estrutura

### `music/`
Coloque aqui suas **músicas MP3 ou WAV** que serão tocadas durante a transmissão ao vivo.

**Exemplo de estrutura:**
```
music/
├── song1.mp3
├── song2.wav
├── electronic_remix.mp3
└── ...
```

### `sounds/`
Efeitos sonoros organizados por tipo:

#### `sounds/transitions/`
Sons tocados quando **muda de level** (transição suave entre cenas)
- Exemplo: `transition_level1_to_2.mp3`

#### `sounds/levelups/`
Sons tocados ao **alcançar novo level**
- Exemplo: `levelup.mp3`, `achievement.wav`

#### `sounds/effects/`
Outros efeitos sonoros
- Exemplos: `drop.mp3`, `kick.wav`, `explosion.mp3`

### `scenes/`
Imagens que formam as **cenas visuais** de cada level

#### `scenes/level1/` e `scenes/level2/`
Para cada level você terá 4 camadas:

1. **background.png** - Fundo da cena (imagem de fundo)
2. **stage.png** - Palco/cenário central
3. **crowd.png** - Multidão/público
4. **effects/** - Efeitos visuais adicionais

**Exemplo de uso no Level Editor:**
```
Level 1 Scene:
├─ background.png (camada de fundo)
├─ stage.png (palco principal)
├─ crowd.png (público)
└─ effects/
   ├─ particles.png
   ├─ lights.png
   └─ lasers.png
```

### `events/`
Imagens e vídeos para **eventos especiais** que podem ser acionados durante a live.

**Exemplos:**
- `explosion.gif` - Animação de explosão
- `confetti.mp4` - Vídeo de confete
- `spotlight.png` - Efeito de iluminação

## 🎯 Como Usar

1. **Adicionar Musica:**
   - Coloque seu arquivo MP3/WAV em `assets/music/`
   - Vá para Playlist Manager no app
   - Clique em "Upload" e selecione o arquivo

2. **Configurar Som de Level Up:**
   - Coloque seu arquivo em `assets/sounds/levelups/`
   - Vá para Level Editor → Config
   - Selecione o arquivo de som para "Level Up Sound"

3. **Criar Cena de Level:**
   - Crie uma pasta `assets/scenes/levelX/` (X = número do level)
   - Adicione as 4 imagens: background.png, stage.png, crowd.png
   - Vá para Level Editor → Visual
   - Configure os caminhos das imagens

## 📊 Recomendações de Tamanho

- **Imagens (PNG/JPG):** 1920x1080px ou maior (Full HD)
- **Efeitos visuais:** 500x500px até 1920x1080px
- **Arquivos de áudio:** MP3 (128-320 kbps), WAV (lossless)

## 📝 Nota Importante

Os caminhos nos arquivos de configuração são **relativos** a esta pasta `assets/`.

Exemplo no banco de dados:
```json
{
  "layers": {
    "background": "scenes/level1/background.png",
    "stage": "scenes/level1/stage.png",
    "crowd": "scenes/level1/crowd.png"
  },
  "sounds": {
    "levelUp": "sounds/levelups/levelup.mp3",
    "transition": "sounds/transitions/transition.mp3"
  }
}
```

