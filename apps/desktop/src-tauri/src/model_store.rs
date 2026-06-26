use aish_ai::ModelProfile;
use std::fs;
use std::path::{Path, PathBuf};

fn manifest_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
}

fn candidate_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Ok(cwd) = std::env::current_dir() {
        paths.push(cwd.join("model_profiles.json"));
        paths.push(cwd.join("apps").join("desktop").join("model_profiles.json"));
    }

    let manifest = manifest_dir();
    paths.push(manifest.join("..").join("model_profiles.json"));
    paths.push(manifest.join("..").join("..").join("..").join("model_profiles.json"));

    paths
}

fn store_path() -> PathBuf {
    candidate_paths()
        .into_iter()
        .find(|path| path.exists())
        .unwrap_or_else(|| manifest_dir().join("..").join("model_profiles.json"))
}

fn read_profiles(path: &Path) -> Result<Vec<ModelProfile>, String> {
    let text = fs::read_to_string(path)
        .map_err(|error| format!("Failed to read {}: {error}", path.display()))?;
    serde_json::from_str(&text)
        .map_err(|error| format!("Failed to parse {}: {error}", path.display()))
}

pub fn list_profiles() -> Result<Vec<ModelProfile>, String> {
    for path in candidate_paths() {
        if path.exists() {
            let profiles = read_profiles(&path)?;
            if !profiles.is_empty() {
                return Ok(profiles);
            }
        }
    }
    Ok(default_profiles())
}

pub fn save_profiles(profiles: Vec<ModelProfile>) -> Result<Vec<ModelProfile>, String> {
    let path = store_path();
    let text = serde_json::to_string_pretty(&profiles).map_err(|error| error.to_string())?;
    fs::write(&path, text).map_err(|error| format!("Failed to write {}: {error}", path.display()))?;
    Ok(profiles)
}

pub fn find_profile(id: &str) -> Result<ModelProfile, String> {
    list_profiles()?
        .into_iter()
        .find(|profile| profile.id == id)
        .ok_or_else(|| format!("missing profile: {id}"))
}

fn default_profiles() -> Vec<ModelProfile> {
    let home = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:/Users/Amaan".to_string()).replace('\\', "/");
    let models = format!("{home}/Downloads/aish-model/models");
    let llama = format!("{home}/Downloads/llama.cpp/build/bin/Release/llama-cli.exe");

    vec![
        profile("ken-v01-f16", "Ken v0.1 F16", "kenwin", &format!("{models}/kenwin-v0.1-f16.gguf"), &llama),
        profile("ken-v01-q4", "Ken v0.1 Q4_K_M", "kenwin", &format!("{models}/kenwin-v0.1-q4_k_m.gguf"), &llama),
        profile("ken-v02-f16", "Ken v0.2 targeted F16", "kenwin", &format!("{models}/kenwin-v0.2-targeted-f16.gguf"), &llama),
        profile("ken-v02-q4", "Ken v0.2 targeted Q4_K_M", "kenwin", &format!("{models}/kenwin-v0.2-targeted-q4_k_m.gguf"), &llama),
        profile("sairaj-qwen25-coder-q4", "Sairaj Qwen2.5 Coder 1.5B Q4_K_M", "baseline", &format!("{models}/qwen2.5-coder-1.5b-instruct.Q4_K_M.gguf"), &llama),
    ]
}

fn profile(id: &str, label: &str, family: &str, model_path: &str, llama_cli_path: &str) -> ModelProfile {
    ModelProfile {
        id: id.to_string(),
        label: label.to_string(),
        family: family.to_string(),
        model_path: model_path.to_string(),
        llama_cli_path: llama_cli_path.to_string(),
        context_tokens: 4096,
        max_tokens: 384,
        temperature: 0.1,
    }
}
