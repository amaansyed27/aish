// @ts-nocheck
import { useEffect, useState } from 'react';
import { backendStatus, getAppState, listModelProfiles } from './lib/api';
import { DEFAULT_MODEL_PROFILES } from './lib/defaultProfiles';
import { useAiRun } from './hooks/useAiRun';
import { AppChrome } from './components/chrome/AppChrome';
import { TerminalCanvas } from './components/terminal/TerminalCanvas';
import { CommandComposer } from './components/terminal/CommandComposer';
import { WorkingTrace } from './components/terminal/WorkingTrace';
import { SettingsDrawer } from './components/settings/SettingsDrawer';

const firstTab = { id: 'tab-1', title: 'PowerShell', cwd: '~' };
function makeTab(cwd: string, index: number) { return { id: `tab-${Date.now()}-${index}`, title: index === 1 ? 'PowerShell' : `PowerShell ${index}`, cwd }; }

export default function App() {
  const [backend, setBackend] = useState('starting');
  const [cwd, setCwd] = useState('~');
  const [tabs, setTabs] = useState([firstTab]);
  const [activeTabId, setActiveTabId] = useState(firstTab.id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profiles, setProfiles] = useState(DEFAULT_MODEL_PROFILES);
  const [selectedProfileId, setSelectedProfileId] = useState(String(DEFAULT_MODEL_PROFILES[0].id));
  const [input, setInput] = useState('');
  const ai = useAiRun(selectedProfileId);

  useEffect(() => {
    backendStatus().then(setBackend).catch(() => setBackend('local preview'));
    getAppState().then((state) => { const nextCwd = String(state.cwd ?? '~'); setCwd(nextCwd); setTabs([{ ...firstTab, cwd: nextCwd }]); }).catch(() => undefined);
    listModelProfiles().then((items) => { const next = items.length ? items : DEFAULT_MODEL_PROFILES; setProfiles(next); setSelectedProfileId(String(next[0]?.id ?? DEFAULT_MODEL_PROFILES[0].id)); }).catch(() => setProfiles(DEFAULT_MODEL_PROFILES));
  }, []);

  function newTab() { setTabs((current) => { const next = makeTab(cwd, current.length + 1); setActiveTabId(next.id); return [...current, next]; }); }
  function closeTab(id: string) { setTabs((current) => { if (current.length === 1) return current; const next = current.filter((tab) => tab.id !== id); if (activeTabId === id) setActiveTabId(next[0].id); return next; }); }
  async function submitPrompt() { const text = input.trim(); if (!text) return; await ai.runIntent(text); setInput(''); }

  return (
    <main className="app-shell">
      <AppChrome backendStatus={backend} cwd={cwd} tabs={tabs} activeTabId={activeTabId} profiles={profiles} selectedProfileId={selectedProfileId} settingsOpen={settingsOpen} onSelectProfile={setSelectedProfileId} onNewTab={newTab} onSelectTab={setActiveTabId} onCloseTab={closeTab} onToggleSettings={() => setSettingsOpen((open) => !open)} />
      <section className="terminal-shell">
        <TerminalCanvas cwd={cwd} result={ai.result} error={ai.error} lastIntent="" busy={ai.isRunning} />
        <WorkingTrace result={ai.result} error={ai.error} />
        <CommandComposer cwd={cwd} value={input} disabled={ai.isRunning} onChange={setInput} onSubmit={submitPrompt} />
      </section>
      <SettingsDrawer open={settingsOpen} cwd={cwd} profiles={profiles} selectedProfileId={selectedProfileId} onSelectProfile={setSelectedProfileId} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
