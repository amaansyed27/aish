// @ts-nocheck
import { useEffect, useState } from 'react';
import { backendStatus, createAiCard, getAppState, listModelProfiles, type ModelRunResult } from './lib/api';
import { AppChrome } from './components/chrome/AppChrome';
import { TerminalCanvas } from './components/terminal/TerminalCanvas';
import { CommandComposer } from './components/terminal/CommandComposer';
import { WorkingTrace } from './components/terminal/WorkingTrace';
import { SettingsDrawer } from './components/settings/SettingsDrawer';

function makeTab(cwd: string, index: number) {
  return { id: crypto.randomUUID(), title: index === 1 ? 'PowerShell' : `PowerShell ${index}`, cwd };
}

export default function App() {
  const [backend, setBackend] = useState('starting');
  const [cwd, setCwd] = useState('~');
  const [tabs, setTabs] = useState([makeTab('~', 1)]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ModelRunResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    backendStatus().then(setBackend).catch(() => setBackend('local preview'));
    getAppState()
      .then((state) => {
        const nextCwd = String(state.cwd ?? '~');
        setCwd(nextCwd);
        setTabs([makeTab(nextCwd, 1)]);
      })
      .catch(() => undefined);
    listModelProfiles()
      .then((items) => {
        setProfiles(items);
        setSelectedProfileId(String(items[0]?.id ?? ''));
      })
      .catch(() => setProfiles([]));
  }, []);

  function newTab() {
    setTabs((current) => {
      const next = makeTab(cwd, current.length + 1);
      setActiveTabId(next.id);
      setResult(null);
      setError('');
      setInput('');
      return [...current, next];
    });
  }

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
      <AppChrome
        backendStatus={backend}
        cwd={cwd}
        tabs={tabs}
        activeTabId={activeTabId}
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        settingsOpen={settingsOpen}
        onSelectProfile={setSelectedProfileId}
        onNewTab={newTab}
        onSelectTab={setActiveTabId}
        onToggleSettings={() => setSettingsOpen((open) => !open)}
      />
      <section className="terminal-shell">
        <TerminalCanvas cwd={cwd} result={result} error={error} />
        <WorkingTrace result={result} error={error} />
        <CommandComposer cwd={cwd} value={input} disabled={busy} onChange={setInput} onSubmit={runAi} />
      </section>
      <SettingsDrawer open={settingsOpen} cwd={cwd} profiles={profiles} selectedProfileId={selectedProfileId} onSelectProfile={setSelectedProfileId} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
