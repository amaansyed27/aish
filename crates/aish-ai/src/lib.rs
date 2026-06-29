use aish_core::Card;
use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio};
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiRequest {
    pub intent: String,
    pub os: String,
    pub shell: String,
    pub context_json: serde_json::Value,
    pub submode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiResponse {
    pub raw: String,
    pub card: Option<Card>,
    pub validation_error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelProfile {
    pub id: String,
    pub label: String,
    pub family: String,
    pub model_path: String,
    pub llama_cli_path: String,
    pub context_tokens: usize,
    pub max_tokens: usize,
    pub temperature: f32,
}

impl Default for ModelProfile {
    fn default() -> Self {
        Self {
            id: "local-gguf".to_string(),
            label: "Local GGUF".to_string(),
            family: "generic".to_string(),
            model_path: String::new(),
            llama_cli_path: "llama-cli".to_string(),
            context_tokens: 4096,
            max_tokens: 192,
            temperature: 0.1,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelRunRequest {
    pub profile: ModelProfile,
    pub prompt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelRunResult {
    pub ok: bool,
    pub command_line: String,
    pub output: String,
    pub error: String,
}

pub trait AiRuntime {
    fn create_card(&self, request: AiRequest) -> AiResponse;
}

pub struct NullAiRuntime;

impl AiRuntime for NullAiRuntime {
    fn create_card(&self, request: AiRequest) -> AiResponse {
        AiResponse {
            raw: String::new(),
            card: None,
            validation_error: Some(format!("No local AI runtime configured for: {}", request.intent)),
        }
    }
}

pub fn build_command_card_prompt(intent: &str, _context_json: &serde_json::Value) -> String {
    format!(
        "You convert natural language into one PowerShell command for AiSH. Return exactly one JSON object and nothing else. No markdown. No commentary. No thinking text.\n\nSchema: {{\"action_type\":\"command\",\"command\":\"...\",\"risk\":\"low|medium|high\",\"reason\":\"short reason\"}}\nFallback: {{\"action_type\":\"fallback_message\",\"fallback_message\":\"...\",\"reason\":\"short reason\"}}\n\nRules:\n- Use PowerShell on Windows.\n- The command will run inside the user's live PowerShell session. Do not invent an absolute current-directory path.\n- If the user does not name a path, use the live shell current directory by omitting -Path.\n- For current directory location, use: Get-Location\n- For listing files, use: Get-ChildItem\n- For list N largest files, use: Get-ChildItem -Recurse -Force -File -ErrorAction SilentlyContinue | Sort-Object -Property Length -Descending | Select-Object -First N Length,FullName\n- For git status, use: git status\n- For npm scripts, use: npm run\n- For finding a file or folder on a named drive, use Get-ChildItem with -Path like D:\\\\, -Recurse, -Force, -Filter, -ErrorAction SilentlyContinue, then Select-Object -ExpandProperty FullName.\n- Recursive searches and long read-only listings are low risk. They may take time, but they do not modify state.\n- Medium/high risk is only for destructive, irreversible, system-changing, network-changing, install, delete, move, write, permission, service, registry, deploy, publish, git reset, git clean, push, or cloud actions.\n- Do not use dir /s unless the user specifically asks for cmd.exe syntax.\n- Do not invent a path. If the user names a drive, search that drive.\n\nExamples:\nUser request: show current directory\n{{\"action_type\":\"command\",\"command\":\"Get-Location\",\"risk\":\"low\",\"reason\":\"Shows the current working directory.\"}}\nUser request: list 20 files in descending order\n{{\"action_type\":\"command\",\"command\":\"Get-ChildItem -Recurse -Force -File -ErrorAction SilentlyContinue | Sort-Object -Property Length -Descending | Select-Object -First 20 Length,FullName\",\"risk\":\"low\",\"reason\":\"Lists the largest files under the current live shell directory.\"}}\nUser request: where is report.pdf in d drive\n{{\"action_type\":\"command\",\"command\":\"Get-ChildItem -Path D:\\\\ -Recurse -Force -Filter 'report.pdf' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName\",\"risk\":\"low\",\"reason\":\"Searches the D drive and prints exact matching paths.\"}}\nUser request: delete all temp files\n{{\"action_type\":\"command\",\"command\":\"Remove-Item -Path .\\*.tmp -Force\",\"risk\":\"high\",\"reason\":\"Deletes files and requires approval.\"}}\n\nUser request: {}\n",
        intent
    )
}

pub fn run_gguf_model(request: ModelRunRequest) -> Result<ModelRunResult, String> {
    if request.profile.model_path.trim().is_empty() {
        return Err("Model path is empty.".to_string());
    }
    if request.profile.llama_cli_path.trim().is_empty() {
        return Err("llama-cli path is empty.".to_string());
    }

    let mut command = Command::new(&request.profile.llama_cli_path);
    command
        .stdin(Stdio::null())
        .arg("-m")
        .arg(&request.profile.model_path)
        .arg("-p")
        .arg(&request.prompt)
        .arg("-n")
        .arg(request.profile.max_tokens.to_string())
        .arg("--temp")
        .arg(request.profile.temperature.to_string())
        .arg("-c")
        .arg(request.profile.context_tokens.to_string())
        .arg("--no-display-prompt")
        .arg("--single-turn")
        .arg("--reasoning")
        .arg("off");

    let command_line = format!(
        "{} -m {} -p <prompt> -n {} --temp {} -c {} --no-display-prompt --single-turn --reasoning off",
        request.profile.llama_cli_path,
        request.profile.model_path,
        request.profile.max_tokens,
        request.profile.temperature,
        request.profile.context_tokens
    );

    let output = command
        .output()
        .map_err(|error| format!("Failed to start local model runtime: {error}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    Ok(ModelRunResult {
        ok: output.status.success(),
        command_line,
        output: clean_model_output(&stdout),
        error: if output.status.success() { String::new() } else { clean_runtime_text(&stderr) },
    })
}

fn clean_model_output(raw: &str) -> String {
    if let Some(json) = extract_json_object(raw) {
        return json;
    }

    let text = clean_runtime_text(raw);
    if text.trim().is_empty() {
        "No model response returned.".to_string()
    } else {
        text
    }
}

fn clean_runtime_text(raw: &str) -> String {
    let mut kept = Vec::new();
    let mut skipping_prompt = false;

    for line in raw.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if trimmed.contains("llama.cpp") || trimmed.starts_with("build") || trimmed.starts_with("model") || trimmed.starts_with("modalities") {
            continue;
        }
        if trimmed == "available commands:" || trimmed.starts_with("/exit") || trimmed.starts_with("/regen") || trimmed.starts_with("/clear") || trimmed.starts_with("/read") || trimmed.starts_with("/glob") {
            continue;
        }
        if trimmed.starts_with('>') {
            skipping_prompt = true;
            continue;
        }
        if skipping_prompt && (trimmed.starts_with("Schema") || trimmed.starts_with("Rules:") || trimmed.starts_with("User request:") || trimmed.starts_with("Example")) {
            continue;
        }
        if trimmed.starts_with("[") && trimmed.contains("thinking") {
            continue;
        }
        kept.push(line);
    }

    kept.join("\n").trim().to_string()
}

fn extract_json_object(text: &str) -> Option<String> {
    let needle = "\"action_type\"";
    let anchor = text.rfind(needle)?;
    let start = text[..anchor].rfind('{')?;
    let mut depth = 0usize;
    let mut in_string = false;
    let mut escaped = false;

    for (offset, ch) in text[start..].char_indices() {
        if escaped {
            escaped = false;
            continue;
        }
        if ch == '\\' && in_string {
            escaped = true;
            continue;
        }
        if ch == '"' {
            in_string = !in_string;
            continue;
        }
        if in_string {
            continue;
        }
        if ch == '{' {
            depth += 1;
        } else if ch == '}' {
            depth = depth.saturating_sub(1);
            if depth == 0 {
                let end = start + offset + ch.len_utf8();
                return Some(text[start..end].trim().trim_matches('`').trim().to_string());
            }
        }
    }

    None
}

pub fn default_timeout() -> Duration {
    Duration::from_secs(60)
}
