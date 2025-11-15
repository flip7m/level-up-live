# 📺 YouTube Live Streaming Setup

## ⚠️ IMPORTANTE: Configuração do FFmpeg

O StreamController está configurado para usar **X11 grab** (captura de tela Linux):

```bash
ffmpeg -f x11grab -video_size 1920x1080 -i :99 \
  -f pulse -i default \
  -c:v libx264 -preset fast -b:v 2500k \
  -c:a aac -b:a 128k \
  -f flv rtmp://a.rtmp.youtube.com/live2/[STREAM_KEY]
```

### Opção 1: X11 Grab (Requer Xvfb)
**Pré-requisito:** Xvfb (X Virtual Framebuffer)

```bash
sudo apt-get install xvfb
# Iniciar Xvfb em display :99
Xvfb :99 -screen 0 1920x1080x24 &
```

Vantagem: Captura tela virtual (sem monitor físico)
Desvantagem: Precisa configurar Xvfb

### Opção 2: HTTP Input (Alternativa)
Modificar `StreamController.ts` para usar:

```bash
ffmpeg -i http://localhost:8020 \
  -c:v libx264 -preset fast -b:v 2500k \
  -c:a aac -b:a 128k \
  -f flv rtmp://a.rtmp.youtube.com/live2/[STREAM_KEY]
```

Vantagem: Mais simples, sem dependências extras
Desvantagem: Menos controle sobre timing/sincronização

---

## 🔧 Configuração Atual

**Arquivo:** `.env`

```
YOUTUBE_STREAM_KEY=k8zd-ycu1-xpdd-vfj7-f8a6
YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2
```

---

## 🎬 Fluxo de Streaming

```
[Node.js Backend]
  ↓
[Spawn FFmpeg Process]
  ↓
[Capture 8020 + Audio]
  ↓
[RTMP → YouTube]
  ↓
[YouTube Live Stream]
```

---

## 📝 Endpoints

- **POST** `/api/stream/start` - Inicia transmissão
- **POST** `/api/stream/stop` - Para transmissão
- **GET** `/api/stream/status` - Status da transmissão

---

## 🧪 Teste Manual

```bash
# Checar status
curl http://localhost:8881/api/stream/status

# Iniciar stream
curl -X POST http://localhost:8881/api/stream/start

# Parar stream
curl -X POST http://localhost:8881/api/stream/stop
```

---

## ⚡ Próximos Passos

1. **Setup Xvfb** (ou mudar para HTTP input)
2. **Testar transmissão**
3. **Implementar YouTube Polling** (detectar Super Chats, viewers)
4. **Criar YouTube Events Service**
5. **Adicionar Auto XP Triggers**
