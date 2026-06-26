# AiSH Architecture

AiSH has one shared local intelligence layer and two user-facing surfaces.

```text
Surfaces:
  - standalone desktop app
  - shell/provider integrations

Shared local layer:
  - context/project inspection engine
  - CLI knowledge layer
  - completion engine
  - history store
  - safety classifier
  - AI command-card runtime
```

## High-Level System

```text
User input
  -> surface adapter
  -> mode router
  -> project/context inspection
  -> CLI knowledge retrieval when needed
  -> candidate generator / Ken runtime planner
  -> card validator
  -> safety classifier
  -> suggestion/result renderer
  -> user accepts OR AI Run low-risk auto-run
  -> shell executes
  -> command trace + event logger
```

## Surfaces

### Desktop App

The app owns the UI and the shell session.

```text
React/Tauri UI
  -> Rust commands/events
  -> PTY session
  -> selected shell
```

Responsibilities:

```text
- render terminal
- manage tabs/panes
- capture input line
- render suggestions
- render cards
- render AI Run result-first view
- render Working / Command Trace details
- expose settings/context/cache UI
- host local service if needed
```

### Provider Layer

The provider layer runs inside or near existing shells.

```text
PowerShell/Zsh/Bash/Fish provider
  -> AiSH local service/protocol
  -> completion candidates / AI requests
  -> shell-native completion UI when possible
```

Responsibilities:

```text
- collect shell context
- request candidates
- record accept/reject events
- trigger AI Suggest/Run explicitly
- expose mode/context/cache controls
- avoid replacing the shell UI
```

## Core Crates

```text
crates/aish-core
  shared types, config, cards, mode router

crates/aish-pty
  PTY sessions, shell process management, resize/input/output

crates/aish-context
  cwd/project/git/package/docker/python/cargo context detection

crates/aish-history
  SQLite command events, frequency/recency indexes, compact recent summaries

crates/aish-completion
  deterministic candidate generation, scoring hooks

crates/aish-cli-knowledge
  CLI registry, local docs cache, safe live help fallback

crates/aish-ai
  Ken/runtime planner bridge, command-card parsing, AI Suggest/AI Run orchestration

crates/aish-safety
  risk classification, confirmation policy, destructive pattern rules

crates/aish-provider
  provider protocol shared by PowerShell/Bash/Zsh/Fish/cmd integrations
```

## Provider Protocol

Provider requests should be small JSON packets.

```json
{
  "request_type": "complete",
  "surface": "powershell-provider",
  "os": "windows",
  "shell": "powershell",
  "mode": "history",
  "cwd": "C:/projects/app",
  "prefix": "npm",
  "context_level": "project",
  "cache_policy": "use_project_cache"
}
```

Response:

```json
{
  "items": [
    {
      "kind": "command",
      "command": "npm run dev",
      "source": "package_scripts",
      "score": 0.92,
      "risk": "low",
      "requires_confirmation": false
    }
  ]
}
```

## AI Run Request

```json
{
  "request_type": "ai_run",
  "surface": "desktop",
  "os": "windows",
  "shell": "powershell",
  "intent": "find the process using port 3000",
  "cwd": "C:/projects/app",
  "context_level": "project",
  "cache_policy": "project_only"
}
```

AI Run can execute only after card validation and safety classification.

## Cards

AI and planners return structured cards.

### Command Card

```json
{
  "action_type": "command",
  "os": "windows",
  "shell": "powershell",
  "command": "git status --short",
  "risk": "low",
  "category": "git",
  "requires_admin": false,
  "modifies_system": false,
  "needs_confirmation": false,
  "reason": "Shows concise Git working tree status."
}
```

### Plan Card

```json
{
  "action_type": "plan",
  "os": "windows",
  "shell": "powershell",
  "command": "",
  "risk": "medium",
  "category": "programming_run",
  "requires_admin": false,
  "modifies_system": true,
  "needs_confirmation": true,
  "reason": "Installs dependencies, then starts the dev server.",
  "steps": [
    {
      "index": 1,
      "command": "npm install",
      "risk": "medium",
      "modifies_system": true,
      "needs_confirmation": true,
      "reason": "Installs missing dependencies."
    },
    {
      "index": 2,
      "command": "npm run dev",
      "risk": "low",
      "modifies_system": false,
      "needs_confirmation": false,
      "reason": "Starts the configured dev script."
    }
  ]
}
```

### Script Card

Script cards are for longer generated scripts, such as read-only PowerShell scans or cleanup workflows.

```json
{
  "action_type": "script",
  "os": "windows",
  "shell": "powershell",
  "script": "Get-ChildItem -Directory $env:USERPROFILE | ForEach-Object { ... }",
  "risk": "low",
  "category": "filesystem",
  "requires_admin": false,
  "modifies_system": false,
  "needs_confirmation": false,
  "reason": "Calculates folder sizes under the user profile.",
  "display_name": "Top folders by size"
}
```

Long scripts require stricter validation. Mutating scripts usually require confirmation.

### Fallback Message

```json
{
  "action_type": "fallback_message",
  "os": "windows",
  "shell": "powershell",
  "command": "",
  "risk": "low",
  "category": "not_a_shell_command",
  "requires_admin": false,
  "modifies_system": false,
  "needs_confirmation": false,
  "reason": "The request is not a terminal command.",
  "fallback_message": "This looks like a writing request, not a shell workflow."
}
```

## Project / Context Engine

Context engine outputs a normalized context packet.

```text
Detected:
- OS and shell
- cwd
- project type
- package manager
- package scripts
- git branch and dirty state
- docker compose files
- Python project metadata
- Rust/Cargo metadata
- cloud/deploy metadata
- installed CLI availability
- recent command summaries when enabled
```

Default AI requests are single-shot. Previous conversation context is not automatically included.

## CLI Knowledge Layer

The CLI knowledge layer provides compact tool context.

```text
Sources:
- built-in CLI registry
- local docs cache
- safe live help fallback
```

It covers common tools first: npm, pnpm, yarn, bun, git, docker, docker compose, kubectl, terraform, AWS, gcloud, az, vercel, firebase, supabase, netlify, wrangler, flutter, cargo, dotnet, go, Java/Maven/Gradle, Python/pip/uv.

## Command Trace

AI Run stores an execution trace.

```text
- detected intent
- context used
- card type
- commands/scripts run
- plan steps
- exit code
- duration
- logs
- command output
- safety decision
```

The UI may label this compactly as `Working`, with expanded title `Command Trace`.

## Cache Strategy

```text
Project cache:
  package scripts, git branches, project type, CLI availability

History cache:
  frequency, recency, accepted/rejected suggestions, compact summaries

Docs cache:
  known CLI docs slices and help outputs

AI cache:
  optional exact-context prompt response cache
```

All cache is local and clearable.

## Safety Layer

Safety runs after every candidate source.

```text
candidate generated by history -> safety
candidate generated by rules   -> safety
candidate generated by AI      -> safety
candidate generated by provider -> safety
```

No candidate bypasses safety.

AI Run may auto-run only validated low-risk cards. Medium/high-risk cards require confirmation.

## Runtime Strategy

MVP:

```text
- deterministic candidates
- project inspection
- no required model
```

Next:

```text
- local ranker for candidate ordering
```

Later:

```text
- Ken/GGUF command-card generator for explicit AI Mode
```
