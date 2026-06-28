import { useState } from 'react';
import { createAiCard, type ModelRunResult } from '../lib/api';

export function useAiRun(selectedProfileId: string) {
  const [result, setResult] = useState<ModelRunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [lastIntent, setLastIntent] = useState('');

  async function runIntent(intent: string) {
    const trimmed = intent.trim();
    if (!trimmed || isRunning) return;

    if (!selectedProfileId) {
      setLastIntent(trimmed);
      setError('No model profile selected. Open Settings and choose a model.');
      setResult(null);
      return;
    }

    setLastIntent(trimmed);
    setIsRunning(true);
    setError('');
    setResult(null);

    try {
      const next = await createAiCard(selectedProfileId, trimmed);
      setResult(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsRunning(false);
    }
  }

  function reset() {
    setResult(null);
    setError('');
    setLastIntent('');
  }

  return { result, isRunning, error, lastIntent, runIntent, reset };
}
