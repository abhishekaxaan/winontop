# WinOnTop

**Version 0.5.0**

Display websites in always-on-top transparent overlay windows. Perfect for keeping reference materials, dashboards, or videos visible while you work.

## Features

- 🪟 **Transparent Overlay Windows** - Display any website in a frameless, transparent window
- 📌 **Always On Top** - Windows stay above all other applications
- 🎨 **Dark Mode Invert** - Toggle color inversion for better visibility
- 👆 **Click-Through Mode** - Make windows transparent to mouse clicks
- 📐 **Custom Resolutions** - Choose from presets (480p, 720p, Full HD, 1440p) or set custom sizes
- 💾 **Save Links** - Store your favorite URLs with custom names
- 🌓 **Light/Dark Theme** - Switch between light and dark UI themes
- 🔄 **Auto-Hide Header** - Overlay header automatically hides when not hovering

## Installation

### From Release (Recommended)
1. Download the latest `.exe` installer from the [Releases](https://github.com/abhishekaxaan/winontop/releases) page
2. Run the installer
3. Launch WinOnTop from your Start Menu or Desktop

### From Source
```bash
# Clone the repository
git clone https://github.com/abhishekaxaan/winontop.git
cd winontop

# Install dependencies
npm install

# Run the app
npm start
```

## Usage

1. **Add a Link**: Enter a URL and optional name, select a resolution preset, then click "Add"
2. **Open Overlay**: Click "Open Overlay" on any saved link to create a transparent window
3. **Overlay Controls**:
   - **◑ Button**: Toggle color inversion (dark mode)
   - **CT Button**: Toggle click-through mode
   - **✕ Button**: Close the overlay
4. **Auto-Hide**: The overlay header automatically hides after 1 second and reappears when you hover over the window

## Building from Source

```bash
# Build Windows installer
npm run build

# Build without installer (portable)
npm run build:dir
```

The built application will be in the `dist` folder.

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **Vanilla JavaScript** - No frameworks, pure JS
- **HTML/CSS** - Modern, responsive UI
- **electron-store** - Persistent data storage

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

**Abhishek Saxena**
- GitHub: [@abhishekaxaan](https://github.com/abhishekaxaan)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### Version 0.5.0 (2026-02-09)
- Initial public release
- Transparent overlay windows with webview support
- Click-through and color inversion features
- Resolution presets and custom sizing
- Auto-hide header functionality
- Light/Dark theme support
- Persistent link storage
