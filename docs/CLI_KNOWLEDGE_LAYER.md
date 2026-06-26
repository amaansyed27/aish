# CLI Knowledge Layer

Ken should not memorize every CLI and should not guess tool syntax from thin air.

AiSH needs a local CLI knowledge layer that provides command templates, cached docs, and safe read-only help fallbacks.

## Purpose

```text
User intent
  -> project inspection
  -> CLI/tool detection
  -> CLI registry lookup
  -> docs cache lookup
  -> safe live help fallback if needed
  -> compact tool context
  -> Ken/runtime planner
  -> command/plan/script/fallback card
```

## Built-in CLI Registry

The registry stores known command templates, risk metadata, and common workflows.

Initial tools:

```text
node/package:
  npm
  yarn
  pnpm
  bun

version control:
  git

containers:
  docker
  docker compose

cloud/devops:
  kubectl
  terraform
  aws
  gcloud
  az
  vercel
  firebase
  supabase
  netlify
  wrangler

framework/language:
  flutter
  cargo
  dotnet
  go
  java
  maven
  gradle
  python
  pip
  uv
```

Registry entries should include:

```text
- command name
- aliases
- detection rules
- common templates
- safe read-only commands
- mutating commands
- destructive commands
- confirmation policy
- docs cache key
```

## Local Docs Cache

AiSH should cache useful docs locally for known tools.

Cache should store compact slices, not entire irrelevant pages.

```text
Cache examples:
- npm scripts / npm run
- pnpm install/dev/build/test
- git status/branch/log/diff
- docker compose up/ps/logs
- kubectl get/describe/logs
- terraform plan/apply/fmt
- vercel deploy/env/project commands
```

Rules:

```text
- local-first
- clearable
- versioned by tool/version when possible
- scoped per CLI family
- never required for basic deterministic templates
```

## Safe Live Help Fallback

For unknown or partially known tools, AiSH may run read-only help commands.

Allowed examples:

```text
tool --help
tool help
tool -h
tool version
tool --version
tool commands
```

Disallowed as help fallback:

```text
install
init that writes files
login that opens auth flow without confirmation
publish
deploy
apply
delete
remove
prune
reset
```

Live help output should be summarized into a compact tool context before passing to Ken.

## Compact Tool Context

Example:

```json
{
  "tool": "pnpm",
  "available": true,
  "version": "9.x",
  "known_commands": ["install", "run", "dev", "test", "build"],
  "project_scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "safe_templates": [
    "pnpm run dev",
    "pnpm test",
    "pnpm run build"
  ],
  "confirmation_required": [
    "pnpm install",
    "pnpm publish"
  ]
}
```

## Relation to Ken

Ken should receive compact retrieved knowledge, not raw large documentation.

Ken can use the retrieved context to produce:

```text
- command card
- plan card
- script card
- fallback message
```

AiSH still validates and risk-checks the result before showing or executing it.

## MVP Registry Templates

Start with high-value deterministic templates.

```text
npm:
  npm run
  npm run dev
  npm run build
  npm test
  npm install

pnpm:
  pnpm install
  pnpm run dev
  pnpm run build
  pnpm test

yarn:
  yarn install
  yarn dev
  yarn build
  yarn test

git:
  git status --short
  git branch --show-current
  git log --oneline -5
  git diff --stat

docker compose:
  docker compose ps
  docker compose up --build
  docker compose logs --tail 100

python:
  python -m pip install -r requirements.txt
  python -m pytest
  python -m uvicorn main:app --reload
```
