# Audio + Video Streaming Solution

**Status:** ✅ Production-Ready | **Last Updated:** November 12, 2025

## Overview

This document describes the **final, tested solution** for combining audio and video in a single FFmpeg stream to YouTube.

### Architecture Summary

```
Xvfb (:99) → Chromium (port 8020) → x11grab (video) + concat demuxer (audio) → FFmpeg → RTMP YouTube
```

**Key Innovation:** Uses FFmpeg's concat demuxer for audio (no browser autoplay policy issues)

## Key Components

### 1. Virtual Display (Xvfb)
- **Purpose:** Provides headless X11 display for Chromium
- **Configuration:** :99 at 1920x1080 @ 30 FPS
- **Why:** Allows capturing UI without physical monitor

### 2. Chromium Browser
- **Purpose:** Renders Level Up Live UI (game state, XP bar, events)
- **Configuration:** Fullscreen on :99, opens http://localhost:8020
- **App Mode:** No browser UI, content only

### 3. Audio Playlist (FFmpeg Concat Demuxer)
- **Purpose:** Manages looping audio from file-based playlist
- **File:** `/tmp/levelup_playlist.txt`
- **Format:** FFmpeg concat demuxer syntax
- **Key Features:**
  - Auto-loops indefinitely with `-stream_loop -1`
  - No browser autoplay restrictions
  - Simple file-based configuration

**Why this approach?**
- ✅ No browser autoplay policy blocking
- ✅ Native FFmpeg audio handling  
- ✅ Simple file-based configuration
- ✅ Automatic looping
- ✅ No separate process needed

### 4. FFmpeg Pipeline
**Inputs:**
```
Input 0: Audio playlist (concat demuxer)
Input 1: Video capture (x11grab from Xvfb)
```

**Encoding:**
```
Video: H.264 @ 2500 kbps, 30 FPS, 1920x1080, YUV420p
Audio: AAC @ 128 kbps, 44.1 kHz
Container: FLV (for RTMP)
```

**Output:** YouTube RTMP streaming

## API Endpoints

### POST /api/stream/start
Starts streaming to YouTube

```bash
curl -X POST http://localhost:8881/api/stream/start
```

**Response:**
```json
{
  "success": true,
  "ffmpegPid": 12345,
  "xvfbPid": 12346,
  "chromiumPid": 12347
}
```

### POST /api/stream/stop
Stops streaming

```bash
curl -X POST http://localhost:8881/api/stream/stop
```

### GET /api/stream/status
Check streaming status

```bash
curl http://localhost:8881/api/stream/status
```

## Configuration

**File:** `.env`

```env
YOUTUBE_STREAM_KEY=your-stream-key-from-youtube-studio
YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2
```

## Audio Files

**Location:** `assets/music/`

**Currently used:**
- `Desabafo.mpeg`
- `Força e Vivência 4.mp3`

## Troubleshooting

### Stream has no audio
1. Check playlist file: `cat /tmp/levelup_playlist.txt`
2. Verify audio files exist: `ls assets/music/`
3. Check FFmpeg logs in console

### Video is black/blank
1. Check API running: `curl http://localhost:8020`
2. Check Xvfb started: `ps aux | grep Xvfb`
3. Check Chromium logs

### FFmpeg errors
1. Look for "concat demuxer" errors
2. Verify playlist format
3. Check file paths are absolute

## Performance Metrics

- **Video bitrate:** 2500 kbps
- **Audio bitrate:** 128 kbps
- **Resolution:** 1920x1080
- **Frame rate:** 30 FPS
- **Network requirement:** 5+ Mbps upload

---

**For complete documentation, see DOCUMENTATION_MAP.md**

See IMMUTABILITY.md for protection details.
