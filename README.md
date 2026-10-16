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

**Windows**
1. Download the latest `WinOnTop Setup x.y.z.exe` installer (or the `WinOnTop Portable x.y.z.exe`) from the [Releases](https://github.com/abhishekaxaan/winontop/releases) page
2. Run the installer
3. Launch WinOnTop from your Start Menu or Desktop

**Linux (Debian / Ubuntu)**
1. Download the latest `.deb` package from the [Releases](https://github.com/abhishekaxaan/winontop/releases) page
2. Install it:
```bash
sudo apt install ./winontop_0.5.0_amd64.deb
```
3. Launch WinOnTop from your application menu, or run `winontop` in a terminal

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
# Build Windows installer (NSIS) and portable
npm run build

# Build Windows portable only (no installer)
npm run build:dir

# Build Linux .deb package
npm run build:linux
```

The built packages will be in the `dist` folder.

Releases are produced automatically by GitHub Actions
([`.github/workflows/build.yml`](.github/workflows/build.yml)): pushing a tag
such as `v0.5.0` builds the Windows installer, Windows portable, and Linux
`.deb`, verifies them, and publishes them to a GitHub Release.

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **Vanilla JavaScript** - No frameworks, pure JS
- **HTML/CSS** - Modern, responsive UI
- **Custom JSON storage** - Persistent data storage via `src/storage.js`

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
- Linux `.deb` package and Windows installer/portable builds
