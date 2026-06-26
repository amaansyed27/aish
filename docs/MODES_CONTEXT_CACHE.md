# Modes, Context, and Cache

AiSH behavior is controlled by three related systems:

```text
- mode
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

### AI

AI-assisted mode.

```text
Suggestions: AI Suggest or AI Ask
History ranking: available as context
Context collection: governed by context level
Model calls: explicit or user-enabled inline suggest
```

## AI Submodes

### AI Suggest

Inline command generation. Designed for short intent-to-command flows.

```text
- user types natural language or prefix
- AiSH builds a context packet
- AI/runtime planner returns command card
- safety classifier checks it
- suggestion appears as ghost text/dropdown/card
```

### AI Ask

Side panel or command palette flow.

```text
- explain command
- debug error
- suggest alternatives
- summarize project
- generate a command with reasoning
```

AI Ask can use more context than AI Suggest, but should still show what context is included.

## Context Levels

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
```

### Terminal

```text
Included:
- recent commands
- last exit code
- recent terminal output window
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

### Full Local

Cache:

```text
- project metadata
- history index
- accepted/rejected suggestions
- AI response cache
- model metadata
```

## User Controls

```text
Set mode:
  Normal | History | AI

Set AI submode:
  Suggest | Ask

Set context:
  Off | Minimal | Project | Terminal | Selected

Set cache:
  Off | Project Only | Full Local
```

## Safety Defaults

Recommended defaults:

```text
mode: History
AI submode: Ask only until user enables Suggest
context: Project
cache: Project Only
history learning: On
AI response cache: Off
```
