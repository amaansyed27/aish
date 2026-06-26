import { useState } from 'react';
import { createAiCard, type ModelRunResult } from '../lib/api';

export function useAiRun(selectedProfileId: string) {
  const [result, setResult] = useState<ModelRunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');

  async function runIntent(intent: string) {
    const trimmed = intent.trim();
    if (!trimmed) return;
    if (!selectedProfileId) {
      setError('No model profile selected.');
      return;
    }

    setIsRunning(true);
    setError('');
    try {
      const next = await createAiCard(selectedProfileId, trimmed);
      setResult(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsRunning(false);
    }
  }

  return { result, isRunning, error, runIntent };
}
