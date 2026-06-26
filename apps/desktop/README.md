# AiSH Desktop

Minimal Tauri + React scaffold for the standalone AiSH app.

Current scaffold includes:

```text
- Warp/PowerShell-style layout
- xterm.js terminal surface placeholder
- Normal / History / AI mode state
- AI Suggest / AI Run state
- context/cache controls
- Working / Command Trace panel
- Rust backend command stubs
```

Run locally:

```powershell
cd apps\desktop
npm install
npm run tauri:dev
```

Next implementation step:

```text
- replace terminal placeholder with real PowerShell PTY bridge
- wire suggestions to Rust completion engine
- wire provider protocol to local service/binary
```
