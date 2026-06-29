import { useState } from 'react';
import { createAiCard, executeShellCommand, type ModelRunResult } from '../lib/api';

type EntryStatus = 'running' | 'done' | 'blocked' | 'error';

interface CommandCard {
  action_type?: string;
  command?: string;
  risk?: string;
  reason?: string;
  fallback_message?: string;
}

export interface TerminalEntry {
  id: string;
  intent: string;
  command?: string;
  output: string;
  error: string;
  reason?: string;
  risk?: string;
  status: EntryStatus;
}

function entryId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseCard(result: ModelRunResult | null): CommandCard | null {
  const raw = String(result?.output ?? '').trim();
  if (!raw) return null;
  const cleaned = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/g, '').trim();
  try {
    return JSON.parse(cleaned) as CommandCard;
  } catch {
    return null;
  }
}

function cleanText(value: unknown) {
  const lines = String(value ?? '').replace(/\r\n/g, '\n').split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  return lines
    .join('\n')
    .replace(/\n[ \t]*\n[ \t]+Directory:/g, '\nDirectory:')
    .replace(/\n[ \t]+Directory:/g, '\nDirectory:');
}

function traceOutput(trace: any) {
  return {
    stdout: cleanText(trace?.output),
    stderr: cleanText(trace?.error),
  };
}

export function useAiRun(selectedProfileId: string) {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [result, setResult] = useState<ModelRunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [lastIntent, setLastIntent] = useState('');

  function updateEntry(id: string, patch: Partial<TerminalEntry>) {
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  }

  async function runCard(id: string, card: CommandCard) {
    const command = String(card.command ?? '').trim();
    if (!command) {
      updateEntry(id, { status: 'error', error: card.fallback_message || card.reason || 'No command returned.', reason: card.reason });
      return;
    }

    if (card.risk && card.risk !== 'low') {
      updateEntry(id, {
        status: 'blocked',
        command,
        risk: card.risk,
        reason: card.reason,
        output: 'AiSH prepared a non-trivial action and held it for review. Open Working to inspect details.',
      });
      return;
    }

    updateEntry(id, { command, risk: card.risk || 'low', reason: card.reason });
    const trace = await executeShellCommand(command, false);
    const { stdout, stderr } = traceOutput(trace);
    updateEntry(id, {
      status: stderr ? 'error' : 'done',
      output: stdout || '(no output)',
      error: stderr,
    });
  }

  async function runIntent(intent: string) {
    const trimmed = intent.trim();
    if (!trimmed || isRunning) return;

    const id = entryId();
    setLastIntent(trimmed);
    setIsRunning(true);
    setError('');
    setResult(null);
    setEntries((current) => [...current, { id, intent: trimmed, output: '', error: '', status: 'running' }]);

    try {
      if (!selectedProfileId) {
        updateEntry(id, { status: 'error', error: 'No model profile selected. Open Settings and choose a model.' });
        return;
      }

      const next = await createAiCard(selectedProfileId, trimmed);
      setResult(next);
      const card = parseCard(next);

      if (!card) {
        updateEntry(id, { status: 'error', error: cleanText(next.output ?? next.error ?? 'Model did not return a command card.') });
        return;
      }

      if (card.action_type === 'fallback_message') {
        updateEntry(id, { status: 'blocked', output: card.fallback_message || card.reason || 'No command available.', reason: card.reason });
        return;
      }

      await runCard(id, card);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(message);
      updateEntry(id, { status: 'error', error: message });
    } finally {
      setIsRunning(false);
    }
  }

  function reset() {
    setEntries([]);
    setResult(null);
    setError('');
    setLastIntent('');
  }

  return { entries, result, isRunning, error, lastIntent, runIntent, reset };
}
