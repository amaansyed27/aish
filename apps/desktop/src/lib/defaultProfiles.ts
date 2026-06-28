import type { ModelProfile } from './api';

const home = 'C:/Users/Amaan';
const modelRoot = `${home}/Downloads/aish-model/models`;
const llamaCli = `${home}/Downloads/llama.cpp/build/bin/Release/llama-cli.exe`;

export const DEFAULT_MODEL_PROFILES: ModelProfile[] = [
  {
    id: 'ken-v01-f16',
    label: 'Ken v0.1 F16',
    family: 'kenwin',
    model_path: `${modelRoot}/kenwin-v0.1-f16.gguf`,
    llama_cli_path: llamaCli,
    context_tokens: 4096,
    max_tokens: 384,
    temperature: 0.1,
  },
  {
    id: 'ken-v01-q4',
    label: 'Ken v0.1 Q4_K_M',
    family: 'kenwin',
    model_path: `${modelRoot}/kenwin-v0.1-q4_k_m.gguf`,
    llama_cli_path: llamaCli,
    context_tokens: 4096,
    max_tokens: 384,
    temperature: 0.1,
  },
  {
    id: 'ken-v02-f16',
    label: 'Ken v0.2 targeted F16',
    family: 'kenwin',
    model_path: `${modelRoot}/kenwin-v0.2-targeted-f16.gguf`,
    llama_cli_path: llamaCli,
    context_tokens: 4096,
    max_tokens: 384,
    temperature: 0.1,
  },
  {
    id: 'ken-v02-q4',
    label: 'Ken v0.2 targeted Q4_K_M',
    family: 'kenwin',
    model_path: `${modelRoot}/kenwin-v0.2-targeted-q4_k_m.gguf`,
    llama_cli_path: llamaCli,
    context_tokens: 4096,
    max_tokens: 384,
    temperature: 0.1,
  },
  {
    id: 'sairaj-qwen25-coder-q4',
    label: 'Sairaj Qwen2.5 Coder 1.5B Q4_K_M',
    family: 'baseline',
    model_path: `${modelRoot}/qwen2.5-coder-1.5b-instruct.Q4_K_M.gguf`,
    llama_cli_path: llamaCli,
    context_tokens: 4096,
    max_tokens: 384,
    temperature: 0.1,
  },
];
