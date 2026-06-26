# AiSH

AiSH is a minimalist AI-native terminal system with two surfaces:

```text
1. Standalone desktop terminal app
2. Shell/provider layer for existing terminals
```

The app is the primary product. The provider layer brings AiSH features into native shells when possible.

AiSH should feel like a clean Warp-style terminal with a PowerShell-native command experience: minimal, keyboard-first, fast, local-first, and not a chatbot UI.

## Product Shape

```text
AiSH = terminal app + provider layer + context engine + CLI knowledge layer + optional Ken model
```

## Surfaces

### 1. Standalone App

A full terminal app like Windows Terminal, Warp, or Terminal.app.

It owns:

```text
- terminal tabs and panes
- shell sessions
- command input
- ghost suggestions
- dropdown suggestions
- command cards
- plan cards
- script cards
- mode switching
- context controls
- cache controls
- safety prompts
- AI Run result view
- Command Trace / Working dropdown
```

Commands still execute through real shells: PowerShell, cmd, Git Bash, Bash, Zsh, Fish, or another configured shell.

### 2. Shell / Provider Layer

A provider layer for existing terminals and shells.

Targets:

```text
Windows:
  PowerShell provider/module first
  Windows Terminal through PowerShell
  cmd shim later

macOS:
  Zsh provider first
  Bash later

Linux/Unix:
  Bash/Zsh/Fish providers through Kenix profiles
```

Providers are thinner than the standalone app. They expose completions, context collection, history capture, and explicit AI actions without replacing the terminal UI.

## Ken Model Family

```text
KenWin -> Windows / PowerShell
KenMac -> macOS / Zsh
Kenix  -> Linux and Unix-like shells
```

Kenix replaces the older idea of a single Bash-only Linux model. Linux needs profiles because Debian/Ubuntu, Fedora/RHEL, Arch, Alpine, and generic POSIX systems differ.

## Modes

AiSH has three primary modes.

### Normal Mode

Plain terminal behavior.

```text
- no ghost text
- no AI
- no ranking
- no suggestions unless manually opened
```

### History Mode

Local suggestions only. No generative AI.

Inputs:

```text
- typed prefix
- command history
- cwd
- project type
- package scripts
- git branches
- recent successful commands
- frequency and recency
```

History suggestions can be cleared.

### AI Mode

Natural-language command help powered by Ken/runtime planner, with strict validation and safety.

AI Mode has two execution submodes:

```text
AI Suggest:
  generate command/plan/script/fallback and show it before running

AI Run:
  generate, validate, risk-check, and run only low-risk command/plan/script cards
```

AI Ask can exist as a side panel or command-palette helper for explanations and debugging, but the core execution submodes are Suggest and Run.

## AI Run UX

AI Run shows the result first.

Example request:

```text
find the 20 biggest folders in my user directory
```

Visible result:

```text
Top 20 largest folders
1. Downloads - 43.2 GB
2. AppData - 28.7 GB
...
```

The user can expand:

```text
Working / Command Trace
```

Trace shows what the app did:

```text
- detected intent
- context used
- commands run
- plan steps
- exit code
- duration
- logs
- command output
- safety decision
```

Do not call this hidden reasoning or thinking. It is execution trace only.

## Context Behavior

By default, each AI prompt is single-shot.

Ken should use only:

```text
- current prompt
- current terminal/app context
- inspected project metadata
- explicitly enabled recent command summaries
```

Ken should not automatically carry old conversation context into every request.

Optional setting:

```text
include summaries of last 5 commands
```

Summaries must be compact, not raw terminal logs.

## Project Inspection

AiSH should inspect the project before invoking Ken.

Detect:

```text
package.json
yarn.lock
pnpm-lock.yaml
package-lock.json
bun.lockb
Dockerfile
docker-compose.yml
docker-compose.yaml
pubspec.yaml
firebase.json
supabase/config.toml
vercel.json
netlify.toml
wrangler.toml
Cargo.toml
pyproject.toml
requirements.txt
.csproj
.sln
go.mod
pom.xml
build.gradle
.git
```

Example compact context:

```json
{
  "project_type": "vite-react",
  "package_manager": "pnpm",
  "node_modules_present": false,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "available_tools": ["node", "pnpm", "git"]
}
```

Then Ken can plan correctly:

```text
pnpm install
pnpm run dev
```

## CLI Knowledge Layer

Ken should not memorize every CLI.

AiSH should provide:

```text
1. built-in CLI registry
2. local docs cache
3. safe live help fallback
```

Initial registry:

```text
npm, yarn, pnpm, bun
git
docker, docker compose
kubectl, terraform
aws, gcloud, az
vercel, firebase, supabase, netlify, wrangler
flutter, cargo, dotnet, go
java, maven, gradle
python, pip, uv
```

Safe live help fallback may run read-only help commands:

```text
tool --help
tool help
tool version
tool commands
```

AiSH retrieves the useful slice and passes compact tool context to Ken.

## Cards

AiSH supports structured cards.

```text
Command Card:
  single command

Plan Card:
  multi-step workflow

Script Card:
  longer generated script, usually PowerShell/Bash/Zsh for complex scans/workflows

Fallback Message:
  non-terminal request or insufficient context
```

## Safety

The model never directly executes anything.

Flow:

```text
User intent
  -> AiSH inspects context
  -> AiSH retrieves CLI/tool docs if needed
  -> Ken/runtime planner predicts command/plan/script/fallback
  -> AiSH validates card
  -> AiSH checks risk
  -> AiSH asks confirmation if needed
  -> AiSH executes only if allowed
```

Low-risk commands may auto-run in AI Run:

```text
list files
show git status
show npm scripts
show processes
read logs
search files
inspect environment
run tests
```

Confirmation required:

```text
install dependencies
delete/move files
git reset / git clean
chmod / chown
service changes
registry edits
cloud mutations
deploy commands
admin commands
production commands
terraform apply
npm publish
```

## Repo Shape

```text
aish/
├── apps/
│   └── desktop/              # Tauri + React app
├── crates/
│   ├── aish-core/            # shared types, cards, modes, config
│   ├── aish-pty/             # PTY and shell sessions
│   ├── aish-context/         # project/context inspection
│   ├── aish-history/         # SQLite history/events
│   ├── aish-completion/      # deterministic completions
│   ├── aish-cli-knowledge/   # CLI registry/docs/help fallback
│   ├── aish-ai/              # Ken/runtime planner bridge
│   ├── aish-safety/          # risk classification
│   └── aish-provider/        # provider protocol
├── providers/
│   ├── powershell/
│   ├── bash/
│   ├── zsh/
│   ├── fish/
│   └── cmd/
├── models/
├── docs/
└── README.md
```

## Build Order

```text
1. Desktop app scaffold
2. minimalist Warp/PowerShell-style UI
3. PowerShell PTY backend
4. Normal / History / AI mode state
5. context/cache controls
6. project inspection engine
7. deterministic completion engine
8. provider protocol
9. PowerShell provider
10. AI Suggest and AI Run card integration
```

Ken is important, but AiSH should not wait for Ken to be perfect. The product should work first with deterministic history/project completions, then plug in Ken as an optional local AI layer.
