# AiSH Design System

AiSH should combine a Warp-like block terminal feel with a PowerShell-native command aesthetic.

## Visual Direction

```text
- minimalist
- dark-first
- calm contrast
- low chrome
- keyboard-first
- readable command blocks
- subtle ghost text
- clear safety states
```

The UI should not feel like a chatbot. AI should appear as a capability inside the terminal, not as the main surface.

## Layout

Primary desktop layout:

```text
┌────────────────────────────────────────────┐
│ Top bar: workspace, shell, mode, context   │
├────────────────────────────────────────────┤
│ Terminal blocks / raw terminal viewport    │
│                                            │
│                                            │
├────────────────────────────────────────────┤
│ Input line + ghost suggestion + status     │
└────────────────────────────────────────────┘
```

Optional AI Ask panel:

```text
┌───────────────────────────────┬────────────┐
│ Terminal                      │ AI Ask     │
│                               │ panel      │
└───────────────────────────────┴────────────┘
```

## Modes UI

Mode indicator should be compact.

```text
Normal  = no suggestions
History = local suggestions
AI      = AI enabled, explicit trigger or inline suggest
```

Suggested labels:

```text
[Normal]
[History]
[AI: Suggest]
[AI: Ask]
```

## Command Suggestions

Suggestion types:

```text
Ghost text:
  inline completion after current cursor.

Dropdown:
  multiple candidates ranked by confidence.

Command card:
  generated command with explanation, risk, and accept/copy actions.
```

## Command Card Shape

```text
Command
Reason
Risk
Context used
Actions: Accept, Copy, Explain, Dismiss
```

Dangerous command cards must be visually distinct and require extra confirmation.

## Context Indicator

Context should be visible as a small status chip.

```text
Context: Off
Context: Minimal
Context: Project
Context: Terminal
Context: Selected
```

Clicking it should open the context panel.

## Cache Indicator

Cache should be quiet but controllable.

```text
Cache: On
Cache: Project only
Cache: Off
```

The cache panel should expose:

```text
- clear project cache
- clear AI cache
- clear history index
- disable history learning
```

## Minimal Color Semantics

Use restrained color. Meaning matters more than decoration.

```text
low risk: neutral
medium risk: warning accent
high risk: destructive accent
AI mode: subtle accent
context disabled: muted
```

## Keyboard Shortcuts

```text
Ctrl+1            Normal Mode
Ctrl+2            History Mode
Ctrl+3            AI Mode
Ctrl+Shift+M      Cycle modes
Ctrl+Space        Open suggestions / AI Ask
Tab               Accept suggestion
Right Arrow       Accept ghost text
Esc               Dismiss suggestion or panel
Alt+Enter         Explain selected command
Ctrl+Shift+C      Copy selection / interrupt-safe copy behavior
Ctrl+Shift+V      Paste
```

## App Personality

AiSH should be:

```text
- fast
- quiet
- local
- predictable
- power-user friendly
- transparent about context and risk
```

It should avoid:

```text
- chat bubbles as the main UI
- unsolicited AI output
- heavy animations
- cluttered dashboards
- hiding safety decisions
```
