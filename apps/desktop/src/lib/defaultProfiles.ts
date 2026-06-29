import type { ModelProfile } from './api';

const home = 'C:/Users/Amaan';
const modelRoot = `${home}/Downloads/aish-model/models`;
const llamaCli = `${home}/Downloads/llama.cpp/build/bin/Release/llama-cli.exe`;

function profile(id: string, label: string, family: string, file: string, contextTokens = 32768): ModelProfile {
  return {
    id,
    label,
    family,
    model_path: `${modelRoot}/${file}`,
    llama_cli_path: llamaCli,
    context_tokens: contextTokens,
    max_tokens: 512,
    temperature: 0.1,
  };
}

export const DEFAULT_MODEL_PROFILES: ModelProfile[] = [
  profile('qwen25-coder-05b-q4', 'Qwen2.5 Coder 0.5B Instruct Q4_K_M', 'qwen2.5-coder', 'qwen2.5-coder-0.5b-instruct-q4_k_m.gguf'),
  profile('qwen25-coder-15b-q4', 'Qwen2.5 Coder 1.5B Instruct Q4_K_M', 'qwen2.5-coder', 'qwen2.5-coder-1.5b-instruct-q4_k_m.gguf'),
  profile('qwen25-coder-3b-q4', 'Qwen2.5 Coder 3B Instruct Q4_K_M', 'qwen2.5-coder', 'qwen2.5-coder-3b-instruct-q4_k_m.gguf'),
  profile('qwen3-06b-q4', 'Qwen3 0.6B Q4_K_M', 'qwen3', 'qwen3-0.6b-q4_k_m.gguf'),
  profile('qwen3-17b-q4', 'Qwen3 1.7B Q4_K_M', 'qwen3', 'qwen3-1.7b-q4_k_m.gguf'),
  profile('qwen35-08b-q4', 'Qwen3.5 0.8B Q4_K_M', 'qwen3.5', 'qwen3.5-0.8b-q4_k_m.gguf'),
  profile('qwen35-2b-q4', 'Qwen3.5 2B Q4_K_M', 'qwen3.5', 'qwen3.5-2b-q4_k_m.gguf'),
];
