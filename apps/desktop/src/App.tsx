// @ts-nocheck
import { useEffect, useState } from 'react';
import { backendStatus, createAiCard, listModelProfiles, type ModelRunResult } from './lib/api';
import { AppChrome } from './components/chrome/AppChrome';
import { TerminalCanvas } from './components/terminal/TerminalCanvas';
import { CommandComposer } from './components/terminal/CommandComposer';
import { WorkingTrace } from './components/terminal/WorkingTrace';

export default function App() {
  const [backend, setBackend] = useState('starting');
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ModelRunResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    backendStatus().then(setBackend).catch(() => setBackend('local preview'));
    listModelProfiles()
      .then((items) => {
        setProfiles(items);
        setSelectedProfileId(String(items[0]?.id ?? ''));
      })
      .catch(() => setProfiles([]));
  }, []);

  async function runAi() {
    const intent = input.trim();
    if (!intent || busy) return;
    if (!selectedProfileId) {
      setError('No model profile selected. Add model_profiles.json and restart.');
      return;
    }

    setBusy(true);
    setError('');
    setResult(null);
    try {
      const output = await createAiCard(selectedProfileId, intent);
      setResult(output);
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <AppChrome backendStatus={backend} profiles={profiles} selectedProfileId={selectedProfileId} onSelectProfile={setSelectedProfileId} />
      <section className="terminal-shell">
        <TerminalCanvas result={result} error={error} />
        <WorkingTrace result={result} error={error} />
        <CommandComposer value={input} disabled={busy} onChange={setInput} onSubmit={runAi} />
      </section>
    </main>
  );
}
