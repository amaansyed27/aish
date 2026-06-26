# AiSH Desktop

Minimal Tauri + React scaffold for the standalone AiSH app.

Current build includes:

```text
- Warp/PowerShell-style layout
- Normal / History / AI mode state
- AI Suggest / AI Run state
- context/cache controls
- deterministic completions from Rust
- project inspection from Rust
- command safety classification
- PowerShell command runner for one-shot commands
- local GGUF model profile bridge
- Working / Command Trace panel
```

Run locally:

```powershell
cd apps\desktop
npm install
npm run tauri:dev
```

Model profile setup:

```powershell
Copy-Item ..\..\model_profiles.example.json ..\..\model_profiles.json
notepad ..\..\model_profiles.json
```

Set each profile's `model_path` and `llama_cli_path` to your local files. Then open AI mode and select the profile.

Current limitation:

```text
The terminal surface is not a full streaming ConPTY session yet.
It supports backend command execution and model invocation first.
Real PTY streaming is the next step.
```
