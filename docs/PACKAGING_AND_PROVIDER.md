# AiSH Provider Shell and Packaging

## Current provider shell shape

AiSH has a cross-platform provider shell binary named `aish` from the `aish-provider-shell` package.

It is one mode only: AI Run.

The user can type natural language directly into the provider prompt. Direct terminal commands still pass through for common shell commands such as `cd`, `dir`, `ls`, `git status`, and `npm -v`.

## Setup wizard

The provider shell supports a first-run setup wizard:

```powershell
.\target\release\aish.exe --setup
```

macOS/Linux:

```bash
./target/release/aish --setup
```

The wizard asks:

```text
Install location
Install type: provider shell only, or desktop app + provider shell
Download Qwen2.5 Coder model now
```

The provider shell is compulsory. The desktop app is optional.

The setup wizard copies the provider shell into the selected install directory and starts the one-time model download when requested.

OS trust note: local setup cannot make a binary trusted by the OS. Windows trust, macOS Gatekeeper trust, and fewer install warnings require release signing/notarization certificates. Unsigned developer builds may still show warnings.

## Model bootstrap

If the provider shell starts and the configured model file does not exist, it prompts to download it.

Default model target:

```text
~/Downloads/aish-model/models/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf
```

Default model URL can be overridden:

```text
AISH_MODEL_URL=https://example.com/model.gguf
AISH_MODEL_PATH=/path/to/model.gguf
```

## Slash commands

Slash commands control AiSH itself and are not sent to the model.

Supported first-pass commands:

```text
/model                 show current model
/model list            list enabled models
/model use <id>        reserved; current build keeps Qwen2.5 Coder only
/status                show OS, shell, model, model path, and llama path
/setup                 run setup wizard
/reasoning on|off      toggle full working trace
/working on|off        alias for reasoning trace
/approve               approve pending risky command
/cancel                cancel pending risky command
/help                  show provider help
/exit                  exit provider shell
//text                 send a literal slash-prefixed line
```

## Enabled model policy

For now the desktop selector and provider shell keep only:

```text
Qwen2.5 Coder 1.5B Instruct Q4_K_M
```

Later settings should support additional local models and providers.

## Runtime configuration

Default Windows local paths match the current development layout:

```text
%USERPROFILE%/Downloads/aish-model/models/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf
%USERPROFILE%/Downloads/llama.cpp/build/bin/Release/llama-cli.exe
```

Portable overrides:

```text
AISH_MODEL_PATH=/path/to/model.gguf
AISH_MODEL_URL=https://example.com/model.gguf
AISH_LLAMA_CLI=/path/to/llama-cli
AISH_TARGET_OS=windows|macos|linux
AISH_TARGET_SHELL=powershell|pwsh|zsh|bash|fish
```

## Build commands

Provider shell:

```powershell
cargo build --release -p aish-provider-shell
```

Desktop app:

```powershell
npm run desktop:build
```

Both:

```powershell
npm run package:all
```

## Local provider shell test

Windows:

```powershell
cargo build --release -p aish-provider-shell
.\target\release\aish.exe --setup
.\target\release\aish.exe
```

macOS/Linux:

```bash
cargo build --release -p aish-provider-shell
./target/release/aish --setup
./target/release/aish
```

Smoke tests:

```text
/status
/model
list files in this folder
where is package.json in this repo
delete temp files
/cancel
/exit
```

## Cross-platform packaging

The workflow `.github/workflows/package.yml` builds on:

```text
windows-latest
macos-latest
ubuntu-22.04
```

Artifacts include:

```text
provider shell binary: aish / aish.exe
desktop bundles from Tauri
```

Manual workflow path:

```text
GitHub -> Actions -> package -> Run workflow
```

## Provider install targets

Windows Terminal profile should launch the provider shell binary directly once packaged:

```text
aish.exe
```

macOS/Linux terminal profiles should launch:

```text
aish
```

Shell integration wrappers can be thin launchers later. The provider shell itself is the cross-platform product boundary.
