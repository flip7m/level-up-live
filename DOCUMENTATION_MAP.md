# Documentation Map - Audio/Video Streaming Solution

**Complete guide to all documentation related to the streaming implementation**

## Core Documents (Read These First)

### 1. **AUDIO_VIDEO_STREAMING.md** 📘 (PRIMARY REFERENCE)
- System architecture and implementation
- Component explanations (Xvfb, Chromium, FFmpeg)
- FFmpeg command reference
- API endpoints with examples
- Troubleshooting guide
- Performance metrics

### 2. **STREAMING_QUICK_REFERENCE.md** ⚡ (QUICK ANSWERS)
- Fast lookup for common tasks
- Start/stop/status commands
- Configuration guide
- Troubleshooting checklist
- Emergency commands

### 3. **IMMUTABILITY.md** 🔒 (PROTECTION PROTOCOL)
- Why solution is locked
- Protection mechanisms
- How to make changes safely
- Emergency procedures

## Code Documentation

### 4. **src/server/controllers/StreamController.ts** 💻
- Core implementation with detailed comments
- Explains every process and parameter
- Process execution order documented
- Error handling strategy

## Git Protection

### 5. **.git/hooks/pre-commit** 🔐
- Prevents commits to protected files
- Protected files list
- To bypass: `git commit --no-verify`

## Quick Navigation

| Question | Answer |
|----------|--------|
| How do I start streaming? | STREAMING_QUICK_REFERENCE.md |
| Stream has no audio | AUDIO_VIDEO_STREAMING.md (Troubleshooting) |
| Need to modify code? | IMMUTABILITY.md |
| What are FFmpeg parameters? | AUDIO_VIDEO_STREAMING.md |
| How add new audio? | STREAMING_QUICK_REFERENCE.md |
| API documentation? | AUDIO_VIDEO_STREAMING.md |
| Performance tuning? | AUDIO_VIDEO_STREAMING.md |

---

**Last updated:** November 12, 2025
**Status:** ✅ Complete and locked
