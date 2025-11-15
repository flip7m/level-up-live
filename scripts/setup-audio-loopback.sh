#!/bin/bash
# Setup PulseAudio loopback for streaming
# Run with: bash setup-audio-loopback.sh

echo "🔊 Setting up PulseAudio loopback..."

# Kill existing loopback if it exists
pulseaudio-ctl mute-input || true
pactl unload-module module-loopback 2>/dev/null || true

# Load loopback module with minimal latency
pactl load-module module-loopback latency_msec=1

echo "✅ PulseAudio loopback loaded!"
echo "Audio will be captured from all sources and looped for streaming."

# List available sources for debugging
echo ""
echo "Available audio sources:"
pactl list sources short
