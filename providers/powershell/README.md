# AiSH PowerShell Provider

Initial PowerShell provider/module scaffold.

Goals:

```text
- expose explicit AiSH commands
- later register native completion hooks
- send compact context packets to local AiSH service/binary
- keep AI explicit
```

Commands:

```powershell
Get-AiSHMode
Set-AiSHMode History
Set-AiSHContext Project
Set-AiSHCache ProjectOnly
Invoke-AiSHSuggest "run this app"
Invoke-AiSHRun "show git status"
Clear-AiSHCache -Project
```

This provider is intentionally thin. The standalone desktop app owns the full UI.
