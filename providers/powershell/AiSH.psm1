Set-StrictMode -Version Latest

$script:AiSHMode = 'History'
$script:AiSHContext = 'Project'
$script:AiSHCache = 'ProjectOnly'

function Get-AiSHMode {
    [CmdletBinding()]
    param()

    [pscustomobject]@{
        Mode = $script:AiSHMode
        Context = $script:AiSHContext
        Cache = $script:AiSHCache
    }
}

function Set-AiSHMode {
    [CmdletBinding()]
    param(
        [ValidateSet('Normal', 'History', 'AI')]
        [string]$Mode
    )

    $script:AiSHMode = $Mode
    Get-AiSHMode
}

function Set-AiSHContext {
    [CmdletBinding()]
    param(
        [ValidateSet('Off', 'Minimal', 'Project', 'Terminal', 'Selected')]
        [string]$Context
    )

    $script:AiSHContext = $Context
    Get-AiSHMode
}

function Set-AiSHCache {
    [CmdletBinding()]
    param(
        [ValidateSet('Off', 'ProjectOnly', 'FullLocal')]
        [string]$Cache
    )

    $script:AiSHCache = $Cache
    Get-AiSHMode
}

function Invoke-AiSHSuggest {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, Position = 0)]
        [string]$Intent
    )

    [pscustomobject]@{
        RequestType = 'ai_suggest'
        Intent = $Intent
        Mode = $script:AiSHMode
        Context = $script:AiSHContext
        Cache = $script:AiSHCache
        Cwd = (Get-Location).Path
        Note = 'Provider scaffold only. Local service call comes next.'
    }
}

function Invoke-AiSHRun {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, Position = 0)]
        [string]$Intent
    )

    [pscustomobject]@{
        RequestType = 'ai_run'
        Intent = $Intent
        Mode = $script:AiSHMode
        Context = $script:AiSHContext
        Cache = $script:AiSHCache
        Cwd = (Get-Location).Path
        Note = 'Provider scaffold only. Low-risk execution gate comes next.'
    }
}

function Clear-AiSHCache {
    [CmdletBinding()]
    param(
        [switch]$Project,
        [switch]$All
    )

    [pscustomobject]@{
        Cleared = if ($All) { 'all' } elseif ($Project) { 'project' } else { 'none' }
        Note = 'Provider scaffold only. Cache backend comes next.'
    }
}

Export-ModuleMember -Function Get-AiSHMode, Set-AiSHMode, Set-AiSHContext, Set-AiSHCache, Invoke-AiSHSuggest, Invoke-AiSHRun, Clear-AiSHCache
