# AiSH Model Plan

AiSH should not depend on a generative model for the first usable build.

The product has two runtime surfaces:

```text
1. standalone desktop app
2. shell/provider layer
```

Both surfaces should work with deterministic completion first. Local AI is an optional layer for explicit AI Mode.

## Staged Model Strategy

```text
v1: deterministic completion engine, no model required
v2: tiny local command ranker, preferably ONNX
v3: optional local command-card generator, Ken/GGUF or equivalent
```

## v1: Deterministic Completion Engine

This is the first shippable intelligence layer.

Sources:

```text
- shell history
- current typed prefix
- current working directory
- package.json scripts
- Makefile targets
- Docker Compose files
- Git branches
- Cargo.toml
- pyproject.toml
- requirements.txt
- common safe shell commands
```

Latency targets:

```text
history/project suggestions: < 30 ms
suggestion dropdown:         < 50 ms
AI generation:               manual trigger only
```

## v2: Tiny Local Ranker

The first trainable model should rank candidates, not generate commands from scratch.

Input:

```json
{
  "shell": "powershell",
  "os": "windows",
  "prefix": "npm",
  "mode": "history",
  "context_level": "project",
  "cwd_type": "node_vite_project",
  "recent_commands": ["npm install", "npm run dev"],
  "candidates": [
    "npm run dev",
    "npm run build",
    "npm test",
    "npm install"
  ]
}
```

Output:

```json
[
  {"command": "npm run dev", "score": 0.94},
  {"command": "npm run build", "score": 0.42},
  {"command": "npm test", "score": 0.30},
  {"command": "npm install", "score": 0.18}
]
```

Recommended runtime:

```text
ONNX Runtime
```

Reasons:

```text
- very fast
- cross-platform
- easy to call from Rust
- suitable for ranking
- smaller than a generative model
```

## v3: Optional Command-Card Generator

Ken belongs here.

Use Ken or another small local generator for explicit AI Mode only.

Use cases:

```text
- AI Suggest: natural language to command card
- AI Ask: command explanation/debugging/alternatives
- fallback classification for non-terminal requests
```

The generator returns structured cards:

```text
- command
- plan
- fallback_message
```

It must not directly execute commands. Every generated card goes through deterministic schema validation and safety classification.

## Ken Integration Boundary

Ken should not own the whole product.

Ken can do:

```text
- generate command cards
- classify fallback vs terminal workflow
- explain command intent
- suggest command alternatives
```

Ken should not do:

```text
- run on every keystroke by default
- bypass deterministic completions
- bypass safety
- decide destructive execution without confirmation
- replace project-specific deterministic rules
```

## Training Data Sources

Training examples can come from:

```text
1. local shell history
2. accepted AiSH suggestions
3. rejected AiSH suggestions
4. successful commands
5. failed commands
6. public command examples
7. CLI documentation examples
8. synthetic command/context pairs
9. hardcase eval failures
```

Local personalization should stay on-device.

## Event Logging Schema

AiSH stores local command events in SQLite.

```sql
CREATE TABLE command_events (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  shell TEXT NOT NULL,
  os TEXT NOT NULL,
  cwd_hash TEXT NOT NULL,
  project_type TEXT,
  typed_prefix TEXT,
  command TEXT NOT NULL,
  source TEXT NOT NULL,
  accepted INTEGER NOT NULL,
  exit_code INTEGER,
  duration_ms INTEGER
);
```

Suggested `source` values:

```text
manual
history_suggestion
project_completion
ai_generated
provider_completion
```

## Feature Inputs For Ranker

```text
- typed prefix
- shell name
- OS
- current directory type
- project type
- detected files
- recent commands
- command frequency
- command recency
- last exit code
- Git branch
- package manager
- available scripts/tasks
- suggestion source
```

## Evaluation Metrics

Track:

```text
- top-1 accuracy
- top-3 accuracy
- accepted suggestion rate
- rejected suggestion rate
- average suggestion latency
- dangerous suggestion rate
- per-shell quality
- per-project-type quality
- fallback accuracy for AI mode
- command-card schema pass rate for AI mode
```

Targets:

```text
top-1 accuracy for repeated workflows: 60%+
top-3 accuracy for repeated workflows: 80%+
history suggestion latency:            < 30 ms
ranker inference latency:              < 10 ms
dangerous silent suggestions:          0
AI raw schema pass rate:               90%+ before shipping AI mode
```

## Safety Layer

Safety is deterministic and separate from all models.

High-risk command patterns:

```text
rm -rf
sudo rm
rmdir /s
del /s /q
git reset --hard
docker system prune
kubectl delete
npm publish
terraform apply
chmod -R 777
drop database
format
```

Policy:

```text
- never auto-accept dangerous commands
- require confirmation for destructive commands
- show explanation before execution
- prefer safer alternatives where possible
- apply safety to history, project, provider, and AI candidates
```

## Final Recommendation

Build in this order:

```text
1. deterministic completion engine
2. local command history scorer
3. provider protocol and PowerShell provider
4. tiny ONNX ranker
5. optional Ken/GGUF command-card generator
```

This keeps AiSH fast, useful, private, and safe while model quality improves separately.
