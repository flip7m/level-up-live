# OBS Setup Guide - Level Up Live Integration

This guide explains how to set up the **Level Up Live** system as a live source in OBS (Open Broadcaster Software) for streaming.

## Overview

Level Up Live provides a fullscreen web-based scene renderer that you can capture directly in OBS using the **Browser Source** feature. This eliminates the need for complex integrations or automation scripts.

## Setup Steps

### 1. Access the Live Stage Page

First, ensure Level Up Live is running on your local machine or network:
- **Frontend**: http://localhost:8882 (or your network IP:8882)
- **Live Stage**: http://localhost:8882/stage (or your network IP:8882/stage)

### 2. Add Browser Source in OBS

1. **Open OBS Studio**
2. In the **Sources** panel, click the **+** button to add a new source
3. Select **Browser** from the list
4. Give it a name (e.g., "Level Up Live Scene") and click **Create New**

### 3. Configure the Browser Source

In the **Browser Source** properties window, set:

- **URL**: `http://localhost:8882/stage`
  - If running on a different machine, replace `localhost` with the IP address where Level Up Live is running
  - Example: `http://192.168.4.115:8882/stage`

- **Width**: `1920` (or your desired stream width)
- **Width**: `1080` (or your desired stream height)

- **FPS**: `60` (recommended for smooth animations)

- **Shutdown source when not visible**: ✓ (optional, for better performance)

- **Refresh browser when source becomes active**: ✓ (recommended)

### 4. Configure Display Settings

In the OBS scene properties:
- Ensure the browser source is positioned to fill your scene
- Adjust the scale if needed using the transformation tools

## Usage in OBS

### Starting a Live Stream

1. Ensure Level Up Live is running and the dashboard is active
2. Start your OBS stream as normal
3. The Live Stage will automatically render the current level's scene

### Controlling the Scene

**From the Level Up Live Interface:**
- Navigate to http://localhost:8882 (Dashboard or Live Control panel)
- Use the level editor to create new scenes
- Use the playlist manager to add songs
- Use the live control panel to manage XP, level-ups, and events

**Scene transitions** are handled automatically:
- Levels advance based on XP progression
- Events trigger temporary visual layers
- All changes are reflected in real-time on the stream

### Keyboard Controls on the Live Stage Page

When viewing the `/stage` page:

| Key | Action |
|-----|--------|
| **F** | Toggle fullscreen mode |
| **W** | Toggle waveform overlay |

## Troubleshooting

### Browser Source Shows Blank Page

1. **Check URL accessibility**: Open the URL directly in your browser to verify it loads
2. **Check firewall**: Ensure port 8882 is accessible (for network IP access)
3. **Refresh the source**: Right-click the browser source and select "Refresh"
4. **Check console logs**: Open DevTools (F12) on the page to see any errors

### Scene Not Updating

1. **WebSocket Connection**: Check browser console for Socket.IO connection errors
2. **Backend Status**: Verify the backend is running on port 8881
3. **Database**: Ensure levels are created in the level editor

### Performance Issues

1. **Lower FPS**: Reduce FPS setting in OBS browser source (try 30 FPS)
2. **Simplify Scenes**: Use static images instead of videos if needed
3. **Disable waveform**: Press W to hide the waveform overlay for better performance

## Advanced Configuration

### Custom Layout

To customize the appearance of the live stage:

1. Edit `src/client/src/styles/livestage.css`
2. Modify colors, positioning, or layout
3. Changes will be reflected automatically if hot-reload is enabled

### Multiple Scenes

You can create multiple `/stage` browser sources with different parameters:

1. Create a base URL with query parameters: `http://localhost:8882/stage?theme=dark`
2. Each source will pull from the same live backend but can have different styling (future enhancement)

## Network Considerations

### Local Network Access

If OBS is running on a different machine:

1. **Find your server IP**:
   - On Windows: Open Command Prompt and run `ipconfig`
   - On Mac/Linux: Run `ifconfig` or `hostname -I`

2. **Use the IP address in OBS**:
   - Example: `http://192.168.4.115:8882/stage` (replace IP with yours)

3. **Ensure firewall allows connections**:
   - Allow port 8881 (backend) and 8882 (frontend) in your firewall

## Best Practices

1. **Test before streaming**: Always verify the scene loads properly in OBS before going live
2. **Monitor performance**: Keep an eye on CPU usage during streaming
3. **Keep browser updated**: Ensure your browser is up-to-date for best compatibility
4. **Use stable hardware**: Run Level Up Live and OBS on the same machine if possible for lowest latency

## Support

For issues or feature requests, please refer to the main project documentation in `docs/PRD.md`.
