# YouTube Streaming Setup Guide

## Overview

This setup captures your live stream page (localhost:8020) and streams it directly to YouTube RTMP.

**Architecture:**
- **Xvfb** - Virtual X11 display (headless)
- **Chromium** - Opens your page (http://localhost:8020) in fullscreen
- **FFmpeg** - Captures the virtual screen + audio and streams to RTMP

## Prerequisites

### 1. YouTube Credentials

Add to your `.env` file:
```env
YOUTUBE_STREAM_KEY=your-stream-key-here
YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2
```

Get these from [YouTube Studio](https://studio.youtube.com/):
1. Go to "Create" → "Go Live"
2. Choose "Stream to a server"
3. Copy the "Stream key" and "Server URL"

### 2. System Dependencies

Run this ONCE (requires sudo):

```bash
sudo bash scripts/setup-stream-capture.sh
```

This installs:
- `xvfb` - Virtual X11 display server
- `chromium` - Browser for capturing
- `pulseaudio` - Audio capture
- `x11-utils` `xdotool` - X11 utilities

## Usage

### Start Streaming

```bash
curl -X POST http://localhost:8881/api/stream/start
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transmissão iniciada (capturando 8020 via Xvfb+Chromium+FFmpeg)",
  "ffmpegPid": 12345,
  "xvfbPid": 12344,
  "chromiumPid": 12343,
  "rtmp": "rtmp://a.rtmp.youtube.com/live2",
  "fps": 30,
  "resolution": "1920x1080",
  "display": ":99"
}
```

### Check Status

```bash
curl http://localhost:8881/api/stream/status
```

**Response:**
```json
{
  "success": true,
  "isStreaming": true,
  "ffmpegPid": 12345,
  "xvfbPid": 12344,
  "chromiumPid": 12343
}
```

### Stop Streaming

```bash
curl -X POST http://localhost:8881/api/stream/stop
```

**Response:**
```json
{
  "success": true,
  "message": "Transmissão parada"
}
```

## What Happens Inside

### Step 1: Virtual Display (Xvfb)
- Creates a virtual X11 display at `:99`
- Resolution: 1920x1080@24bpp
- Lightweight - no GPU needed

### Step 2: Browser (Chromium)
- Launches in fullscreen on the virtual display
- Opens http://localhost:8020
- Waits 5 seconds for page to load fully

### Step 3: Screen Capture (FFmpeg)
- Captures video from virtual display using `x11grab`
- Captures audio from PulseAudio (optional, can fail safely)
- Encodes to H.264 + AAC
- Streams to YouTube RTMP

**FFmpeg Arguments:**
```
-video_size 1920x1080
-framerate 30
-f x11grab -i :99.0          # Screen capture
-f pulse -i default           # Audio capture (PulseAudio)
-c:v libx264 -preset veryfast # Video encoding
-b:v 2500k -maxrate 3000k     # Video bitrate
-c:a aac -b:a 128k            # Audio encoding
-f flv                         # RTMP output format
```

## Troubleshooting

### Error: "Xvfb: command not found"

Run setup first:
```bash
sudo bash scripts/setup-stream-capture.sh
```

### Error: "chromium: command not found"

Chromium might be installed as `chromium-browser`:
```bash
sudo ln -s /usr/bin/chromium-browser /usr/bin/chromium
```

Or update the script to use `chromium-browser` instead.

### Stream won't start / page won't load

1. Check if localhost:8020 is running:
   ```bash
   curl http://localhost:8020
   ```

2. Check logs:
   ```bash
   # From the root project directory
   tail -f data/logs/app.log | grep Stream
   ```

3. Check FFmpeg is installed:
   ```bash
   ffmpeg -version
   ```

### No audio in stream

PulseAudio is optional. If it fails, FFmpeg will still stream video-only.

To enable audio:
```bash
pulseaudio --start --exit-idle-time=-1
pactl list sources short  # Check available audio sources
```

### Stream quality issues

Adjust bitrate in `StreamController.ts`:

```typescript
// Current: 2500k video bitrate
'-b:v', '2500k',      // Change to: '4000k', '6000k', etc.
'-maxrate', '3000k',  // Change to: '5000k', '7000k', etc.
```

### Stream stutters / CPU high

- Reduce framerate: `-framerate 25` or `20`
- Reduce resolution: `1280x720` instead of `1920x1080`
- Use faster encoder: `-preset ultrafast` instead of `veryfast`

## Monitoring

### View Live Logs

In another terminal:
```bash
cd "/home/umbrel/umbrel/home/APPS/Level Up/level-up-live-mk1"
npm run dev  # or tail logs
```

Or check the browser console at http://localhost:8881

### Check Process IDs

```bash
ps aux | grep -E "Xvfb|chromium|ffmpeg" | grep -v grep
```

### View Stream Status in Browser

Open http://localhost:8881 and click the "Stream" control panel.

The UI will show:
- Streaming status (red dot = active)
- Start/Stop buttons
- Live state updates via Socket.IO

## Advanced

### Custom Display Settings

Edit `StreamController.ts` constants:
```typescript
const VIRTUAL_DISPLAY = ':99'        // X11 display number
const CAPTURE_WIDTH = 1920          // Capture width
const CAPTURE_HEIGHT = 1080         // Capture height
const CAPTURE_FPS = 30              // Frames per second
```

### Run as systemd Service

Create `/etc/systemd/system/level-up-stream.service`:

```ini
[Unit]
Description=Level Up Live Stream Capture
After=network.target

[Service]
Type=simple
User=umbrel
WorkingDirectory=/home/umbrel/umbrel/home/APPS/Level Up/level-up-live-mk1
ExecStart=/usr/bin/npm run dev
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable level-up-stream
sudo systemctl start level-up-stream
```

## Performance Notes

**CPU Usage:** ~40-60% (H.264 encoding at 1920x1080@30fps)

**Memory Usage:** ~300MB (Chromium + FFmpeg)

**Network:** ~3-4 Mbps upstream (depends on bitrate)

**Requirements:**
- 2+ CPU cores minimum
- 4GB RAM recommended
- Stable internet connection
- No GPU required (software encoding)

## FAQ

**Q: Can I use a different browser?**
A: Yes, modify `chromiumProcess = spawn('chromium', ...` to use Firefox or others.

**Q: Can I stream to Twitch instead?**
A: Yes, change `YOUTUBE_RTMP_URL` to Twitch's RTMP endpoint.

**Q: What if Chromium crashes?**
A: FFmpeg will continue streaming, but the page content won't update. Restart the stream.

**Q: Can I stream a different URL?**
A: Yes, change `'--app=http://localhost:8020'` to any URL.

**Q: Is X11 required?**
A: Yes for this approach. We use Xvfb (virtual X11) so no GUI is needed.

## See Also

- [StreamController.ts](src/server/controllers/StreamController.ts) - Main implementation
- [Socket.IO Integration](src/server/socket.ts) - Real-time state updates
- [Frontend Stream Control](src/client/src/components/stream/StreamControl.tsx) - UI component
- [YouTube RTMP Setup](https://support.google.com/youtube/answer/2853702)

---

**Questions?** Check the logs in `data/logs/app.log` or the browser console.
