use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PtyError {
    #[error("PTY backend is not implemented yet for this platform")]
    NotImplemented,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShellConfig {
    pub shell: String,
    pub args: Vec<String>,
    pub cwd: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PtySize {
    pub rows: u16,
    pub cols: u16,
}

pub trait PtySession {
    fn write(&mut self, bytes: &[u8]) -> Result<(), PtyError>;
    fn resize(&mut self, size: PtySize) -> Result<(), PtyError>;
    fn shutdown(&mut self) -> Result<(), PtyError>;
}

pub fn default_windows_shell() -> ShellConfig {
    ShellConfig {
        shell: "powershell.exe".to_string(),
        args: vec!["-NoLogo".to_string()],
        cwd: None,
    }
}
