# Audio/Video Streaming - Quick Reference Guide

**⚡ TL;DR Version** | See AUDIO_VIDEO_STREAMING.md for complete documentation

## Starting a Stream

```bash
curl -X POST http://localhost:8881/api/stream/start
```

## Checking Stream Status

```bash
curl http://localhost:8881/api/stream/status
```

## Stopping a Stream

```bash
curl -X POST http://localhost:8881/api/stream/stop
```

## Configuration

**File:** `.env`

```env
YOUTUBE_STREAM_KEY=your-key
YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2
```

## Audio Files

**Location:** `assets/music/`

Currently:
- `Desabafo.mpeg`
- `Força e Vivência 4.mp3`

## Key Processes

- **Xvfb** - Virtual X11 display on :99
- **Chromium** - Renders UI on port 8020
- **FFmpeg** - Encodes and streams to YouTube

## Troubleshooting

### No audio?
- Check: `cat /tmp/levelup_playlist.txt`
- Check: `ls assets/music/`

### Black video?
- Check: `curl http://localhost:8020`
- Check: `ps aux | grep Xvfb`

### FFmpeg errors?
- Look for concat demuxer errors in logs
- Verify playlist file format
- Check audio file paths are absolute

## Emergency

```bash
# Kill everything
pkill -f Xvfb && pkill -f chromium && pkill -f ffmpeg
```

---

See DOCUMENTATION_MAP.md for all documentation
