use aish_core::RiskLevel;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskDecision {
    pub risk: RiskLevel,
    pub needs_confirmation: bool,
    pub reason: String,
}

pub fn classify_risk(command: &str) -> RiskDecision {
    let normalized = command.to_lowercase();
    let high_risk = [
        "rm -rf",
        "del /s /q",
        "rmdir /s",
        "git reset --hard",
        "git clean",
        "docker system prune",
        "kubectl delete",
        "npm publish",
        "terraform apply",
        "chmod -r 777",
        "format",
        "drop database",
    ];

    if high_risk.iter().any(|pattern| normalized.contains(pattern)) {
        return RiskDecision {
            risk: RiskLevel::High,
            needs_confirmation: true,
            reason: "Matches a destructive or production-impacting command pattern.".to_string(),
        };
    }

    let medium_risk = [
        "npm install",
        "pnpm install",
        "yarn install",
        "pip install",
        "cargo install",
        "docker compose up",
        "vercel deploy",
        "firebase deploy",
        "netlify deploy",
        "wrangler deploy",
        "az ",
        "aws ",
        "gcloud ",
    ];

    if medium_risk.iter().any(|pattern| normalized.contains(pattern)) {
        return RiskDecision {
            risk: RiskLevel::Medium,
            needs_confirmation: true,
            reason: "May modify local dependencies, services, or remote/cloud state.".to_string(),
        };
    }

    RiskDecision {
        risk: RiskLevel::Low,
        needs_confirmation: false,
        reason: "Read-only or low-risk command pattern.".to_string(),
    }
}
