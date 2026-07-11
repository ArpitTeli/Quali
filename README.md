# Quali — Lead Review Tool (Electron)

Desktop app for batch-reviewing business leads. Load an Excel file, open Google Search tabs in batches, triage each lead (Good/Maybe/Bad) via a floating mini-player, and maintain a local master Excel with auto-updated status colors.

Part of a 3-app product suite for a web dev startup: **Quali** (lead qualifier) + **Manager CRM** + **Dev Board**.

## Tech Stack

- **Electron** 30 + **React** 18 + **Vite** 5
- **SheetJS** (xlsx) for Excel read/write
- **electron-builder** for packaging (NSIS installer on Windows, DMG on Mac)
- **electron-updater** for auto-updates via GitHub Releases
- **GitHub Actions** for CI (Mac builds on tag push)

## Features

- **Glassmorphic login** — frameless window with draggable login card
- **Excel import** — drag-and-drop or browse `.xlsx`/`.xls` files
- **Auto column detection** — maps `name`, `query`, `website`, `company_phone`, `email` case-insensitively
- **Batch Google Search** — opens tabs in configurable batches (default 20)
- **Floating mini-player** — always-on-top frameless window for triage
- **Tag leads** — Good (green), Maybe (yellow), Bad (red)
- **Local master Excel** — `Documents/quali_master.xlsx` with status colors
- **Cloud master dedup** — skips leads already tagged by other qualifiers
- **Master viewer** — full table with Discard, Push, and Comments
- **Push to shared sheet** — sends qualified leads to a shared Google Sheet via Apps Script
- **Manual lead add** — add leads directly from the UI
- **Export** — download tagged leads as Excel
- **Competition leaderboard** — see who pushed the most leads
- **Notifications & Tasks** — activity log and todo list

## Installation

```bash
npm install
```

## Development

```bash
# Start Vite dev server + Electron
npm run electron:dev
```

## Build

```bash
# Windows
npm run electron:build:win

# Mac
npm run electron:build:mac

# Linux
npm run electron:build:linux
```

Output goes to `release/`.

## CI/CD

Mac builds run automatically via GitHub Actions when you push a version tag:

```bash
git tag v1.3.19
git push origin v1.3.19
```

Windows builds are done manually (no code signing).

## Project Structure

```
Quali/
├── src/
│   ├── main/           # Electron main process
│   │   └── index.js    # Window management, IPC, auto-updater
│   ├── preload.js      # IPC bridge (contextBridge)
│   ├── renderer/       # React app (Vite-bundled)
│   │   └── src/
│   │       ├── App.jsx
│   │       └── ...
│   └── mini-player/    # Floating mini-player window
├── quali-web/          # Web version (separate repo)
├── .github/workflows/  # CI (Mac builds)
├── package.json
└── vite.config.js
```

## Data Flow

```
Excel File → FilePicker → SetupView → Batch Review (BottomBar)
                                          ↓
                                   handleTag → Cloud Master (Apps Script)
                                             → Per-User Master Sheet (Apps Script)
                                          ↓
                                   Master Viewer → Discard / Push / Comments
                                          ↓
                                   Export → Excel download
```

## Apps Script Setup

Quali uses 4 Google Apps Scripts (deployed as Web Apps):

| Script | Purpose |
|--------|---------|
| Auth | Login + auto-create per-user master sheet |
| Cloud Master | Cross-user dedup (names + phones) |
| Push | Shared Google Sheet for pushed leads |
| Per-User Master | Read/write/discard/stats for personal master sheet |

See `quali-web/APPS_SCRIPT_*.js` for the source code.

## Configuration

- **Config**: `%APPDATA%/Quali/config.json` (Electron)
- **Master Excel**: `Documents/quali_master.xlsx`
- **Recovery**: `%APPDATA%/Quali/recovery.json`

## Version History

Current: **1.3.18** ([Releases](https://github.com/ArpitTeli/Quali/releases))

## License

Private — All rights reserved.
