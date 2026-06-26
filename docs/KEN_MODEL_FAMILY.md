# Ken Model Family

Ken is the local AI layer for AiSH. AiSH itself should work without Ken, but Ken powers explicit AI Mode when a local model is available.

## Target Model Families

```text
KenWin -> Windows / PowerShell
KenMac -> macOS / Zsh
Kenix  -> Linux and Unix-like shells
```

## KenWin

Primary target:

```text
OS:    Windows
Shell: PowerShell first
Also:  cmd, Git Bash later
```

KenWin should be optimized for:

```text
- PowerShell command cards
- Windows filesystem commands
- Windows process/network inspection
- npm/pnpm/yarn workflows on Windows
- Docker Desktop workflows
- Windows path handling
- confirmation rules for destructive/admin actions
```

## KenMac

Primary target:

```text
OS:    macOS
Shell: Zsh first
Also:  Bash later
```

KenMac should be optimized for:

```text
- Zsh-friendly commands
- macOS filesystem conventions
- Homebrew workflows
- Xcode/toolchain checks
- launchctl/service inspection
- macOS app/project workflows
```

## Kenix

Kenix is the Linux/Unix model family. It replaces the older idea of a single KenLin Bash-only target.

Primary target:

```text
OS:      Linux / Unix-like
Shells:  Bash, Zsh, Fish
Profiles:
  - generic-posix
  - debian-ubuntu
  - fedora-rhel
  - arch
  - alpine
```

Kenix should account for distro differences instead of assuming every Linux host is the same.

Examples:

```text
Debian/Ubuntu:
  apt, systemctl, ufw, dpkg

Fedora/RHEL:
  dnf, rpm, systemctl, firewalld

Arch:
  pacman, yay/paru when available, systemctl

Alpine:
  apk, OpenRC/service, musl differences
```

## Shell/provider mapping

```text
Standalone app:
  can run any configured shell through PTY.

Provider layer:
  KenWin -> PowerShell provider/module
  KenMac -> Zsh plugin/provider
  Kenix  -> Bash/Zsh/Fish providers with distro profile detection
```

## Important Boundary

Ken should not guess from thin air.

AiSH should first inspect:

```text
- OS
- shell
- distro/platform
- cwd
- project files
- installed CLIs
- cached CLI docs
- package manager
- recent command summaries when enabled
```

Then Ken receives compact context and returns a structured card.

## Runtime placement

```text
Normal Mode:
  no Ken

History Mode:
  no Ken by default; ranker may be used later

AI Suggest:
  Ken may generate a command/plan/script/fallback card

AI Run:
  Ken may generate a card, but AiSH validates, risk-checks, and executes only low-risk cards automatically
```
