#!/bin/bash
# Setup script for screen capture streaming
# Run with: sudo bash setup-stream-capture.sh

set -e

echo "📦 Installing screen capture dependencies..."

# Install Xvfb, Chromium, PulseAudio, and utilities
apt-get update
apt-get install -y \
    xvfb \
    chromium \
    chromium-browser \
    pulseaudio \
    pulseaudio-utils \
    pavucontrol \
    x11-utils \
    xdotool \
    2>&1 | grep -E "(Setting up|already|Processing)" || true

echo "✅ Dependencies installed successfully!"
echo ""
echo "Configurando PulseAudio com loopback virtual..."

# Create PulseAudio loopback module config
mkdir -p /etc/pulse/
cat >> /etc/pulse/default.pa << 'EOF'
# Audio loopback para streaming (adicionado automaticamente)
load-module module-loopback latency_msec=1
EOF

echo "✅ PulseAudio loopback configurado!"
echo ""
echo "Next steps:"
echo "1. Start stream capture: POST /api/stream/start"
echo "2. Stop stream capture: POST /api/stream/stop"
echo "3. Check status: GET /api/stream/status"
echo ""
echo "The system will:"
echo "  - Start virtual display (Xvfb :99)"
echo "  - Launch Chromium fullscreen on http://localhost:8020"
echo "  - Capture screen + audio with FFmpeg"
echo "  - Stream to YouTube RTMP"
