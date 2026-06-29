use aish_ai::ModelProfile;
use std::env;
use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};

const DEFAULT_MODEL_URL: &str = "https://huggingface.co/bartowski/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf?download=true";

pub fn handle_setup_args() {
    if !env::args().any(|arg| arg == "--setup") {
        return;
    }

    let install_dir = prompt_with_default("Install location", default_install_dir().display().to_string());
    let install_dir = PathBuf::from(install_dir);
    let install_kind = prompt_with_default("Install type: 1 provider shell only, 2 desktop app + provider shell", "2".to_string());
    let download_model = prompt_yes_no("Download the Qwen2.5 Coder model now", true);

    if let Err(error) = fs::create_dir_all(install_dir.join("bin")) {
        eprintln!("setup failed: could not create install directory: {error}");
        std::process::exit(1);
    }

    match env::current_exe() {
        Ok(current) => {
            let name = if cfg!(target_os = "windows") { "aish.exe" } else { "aish" };
            let target = install_dir.join("bin").join(name);
            if let Err(error) = fs::copy(&current, &target) {
                eprintln!("setup warning: could not copy provider shell: {error}");
            } else {
                println!("installed provider shell: {}", target.display());
            }
        }
        Err(error) => eprintln!("setup warning: could not locate current executable: {error}"),
    }

    if install_kind.trim() == "2" {
        println!("desktop app install selected; package installer will place the desktop bundle for this OS.");
    } else {
        println!("provider shell only selected.");
    }

    println!("trusted app note: OS trust requires code signing/notarization certificates. This setup prepares local install paths; signed release builds will remove most OS trust prompts.");

    if download_model {
        let model_path = default_model_path();
        if let Err(error) = download_model_if_missing(&model_path) {
            eprintln!("model download failed: {error}");
            eprintln!("set AISH_MODEL_PATH to an existing GGUF file, or retry setup later.");
        }
    }

    println!("setup complete");
    std::process::exit(0);
}

pub fn ensure_model(profile: &ModelProfile) {
    let path = PathBuf::from(&profile.model_path);
    if path.exists() {
        return;
    }

    println!("model not found: {}", path.display());
    if !prompt_yes_no("Download it now", true) {
        return;
    }

    if let Err(error) = download_model_if_missing(&path) {
        eprintln!("model download failed: {error}");
    }
}

fn download_model_if_missing(path: &Path) -> Result<(), String> {
    if path.exists() {
        println!("model already exists: {}", path.display());
        return Ok(());
    }

    let url = env::var("AISH_MODEL_URL").unwrap_or_else(|_| DEFAULT_MODEL_URL.to_string());
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("failed to create {}: {error}", parent.display()))?;
    }

    println!("downloading model to {}", path.display());
    println!("source: {url}");

    let response = ureq::get(&url).call().map_err(|error| error.to_string())?;
    let total = response
        .header("content-length")
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(0);
    let mut reader = response.into_reader();
    let mut file = File::create(path).map_err(|error| format!("failed to create {}: {error}", path.display()))?;
    let mut buf = [0u8; 1024 * 128];
    let mut written = 0u64;

    loop {
        let n = reader.read(&mut buf).map_err(|error| error.to_string())?;
        if n == 0 {
            break;
        }
        file.write_all(&buf[..n]).map_err(|error| error.to_string())?;
        written += n as u64;
        if total > 0 {
            let pct = (written as f64 / total as f64) * 100.0;
            print!("\r{pct:.1}%");
            let _ = io::stdout().flush();
        }
    }

    if total > 0 {
        println!();
    }
    println!("model ready: {}", path.display());
    Ok(())
}

fn prompt_with_default(label: &str, default_value: String) -> String {
    print!("{label} [{default_value}]: ");
    let _ = io::stdout().flush();
    let mut input = String::new();
    if io::stdin().read_line(&mut input).is_err() {
        return default_value;
    }
    let trimmed = input.trim();
    if trimmed.is_empty() { default_value } else { trimmed.to_string() }
}

fn prompt_yes_no(label: &str, default_yes: bool) -> bool {
    let suffix = if default_yes { "Y/n" } else { "y/N" };
    print!("{label} [{suffix}]: ");
    let _ = io::stdout().flush();
    let mut input = String::new();
    if io::stdin().read_line(&mut input).is_err() {
        return default_yes;
    }
    match input.trim().to_lowercase().as_str() {
        "y" | "yes" => true,
        "n" | "no" => false,
        _ => default_yes,
    }
}

fn default_install_dir() -> PathBuf {
    if cfg!(target_os = "windows") {
        env::var("LOCALAPPDATA").map(PathBuf::from).unwrap_or_else(|_| home_dir()).join("AiSH")
    } else if cfg!(target_os = "macos") {
        home_dir().join("Applications").join("AiSH")
    } else {
        home_dir().join(".local").join("aish")
    }
}

fn default_model_path() -> PathBuf {
    if let Ok(path) = env::var("AISH_MODEL_PATH") {
        return PathBuf::from(path);
    }
    home_dir()
        .join("Downloads")
        .join("aish-model")
        .join("models")
        .join("Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf")
}

fn home_dir() -> PathBuf {
    env::var("USERPROFILE")
        .or_else(|_| env::var("HOME"))
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
}
