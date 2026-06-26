# Modes, Context, and Cache

AiSH behavior is controlled by three related systems:

```text
- mode
- AI submode
- context level
- cache policy
```

These controls must be visible in the app and available through the provider layer.

## Modes

### Normal

Plain terminal.

```text
Suggestions: off
AI: off
History ranking: off
Context collection: minimal session metadata only
```

### History

Local completion mode.

```text
Suggestions: on
AI: off by default
History ranking: on
Context collection: project metadata only as needed
```

History Mode can use command history and deterministic project completions. It should not call Ken or any generative model.

### AI

AI-assisted mode.

```text
Suggestions: AI Suggest or AI Run
History ranking: available as compact context when enabled
Context collection: governed by context level
Model calls: explicit or user-enabled inline suggest/run only
```

AI Mode is still bounded by validation and safety. The model never directly executes anything.

## AI Submodes

### AI Suggest

Generate command/plan/script/fallback and show it before running.

```text
- user types natural language or prefix
- AiSH builds a context packet
- AiSH retrieves CLI docs/tool context if needed
- Ken/runtime planner returns a card
- validator checks structure
- safety classifier checks risk
- suggestion appears as ghost text/dropdown/card
- user accepts, copies, edits, or dismisses
```

### AI Run

Generate, validate, risk-check, and run only low-risk cards.

```text
- user types natural-language request
- AiSH inspects context
- Ken/runtime planner returns a card
- AiSH validates the card
- AiSH checks risk
- low-risk commands may run directly
- medium/high-risk commands require confirmation
- result is shown first
- Working / Command Trace can be expanded
```

AI Run must not show hidden model reasoning. The trace shows execution details only.

### AI Ask

AI Ask can exist as a side panel or command palette helper, but it is not the primary execution submode.

Use cases:

```text
- explain command
- debug error
- suggest alternatives
- summarize project
- generate a command with explanation
```

AI Ask can use more context than AI Suggest, but should still show what context is included.

## Context Levels

By default, AI prompts are single-shot. AiSH should not automatically include old conversation context in every request.

### Off

```text
Included:
- shell
- OS
- typed text

Excluded:
- cwd contents
- package files
- git state
- terminal output
- recent commands
```

### Minimal

```text
Included:
- shell
- OS
- cwd path basename or hashed path
- detected project type
```

### Project

```text
Included:
- package.json scripts
- lockfile/package manager
- git branch/status summary
- docker compose presence
- pyproject/requirements metadata
- Cargo.toml metadata
- cloud/deploy metadata
- installed CLI availability
```

### Terminal

```text
Included:
- recent commands
- last exit code
- compact summaries of recent terminal output
```

Terminal context should use compact summaries, not full raw logs.

Optional setting:

```text
include summaries of last 5 commands
```

Example:

```json
{
  "recent_commands": [
    {
      "command": "npm run dev",
      "exit_code": 1,
      "summary": "Failed because port 5173 is already in use"
    }
  ]
}
```

### Selected

```text
Included:
- only user-selected text
- shell/OS
- current command line
```

## Cache Policies

### Off

No reusable cache except required runtime state.

### Project Only

Cache project detection and scripts.

```text
- project type
- package scripts
- package manager
- git branches
- CLI availability
```

### Full Local

Cache:

```text
- project metadata
- history index
- accepted/rejected suggestions
- local docs slices
- safe help command output
- AI response cache
- model metadata
```

## User Controls

```text
Set mode:
  Normal | History | AI

Set AI submode:
  Suggest | Run

Open AI Ask:
  explicit side panel / command palette action

Set context:
  Off | Minimal | Project | Terminal | Selected

Set cache:
  Off | Project Only | Full Local
```

## Safety Defaults

Recommended defaults:

```text
mode: History
AI submode: Suggest until user enables Run
context: Project
cache: Project Only
history learning: On
AI response cache: Off
include last 5 command summaries: Off
```

AI Run defaults:

```text
auto-run low-risk only
confirm medium/high-risk
never run fallback
never run invalid cards
never bypass safety
```
