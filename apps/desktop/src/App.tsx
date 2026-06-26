// @ts-nocheck
import { useEffect, useState } from 'react';
import { backendStatus, getAppState, listModelProfiles } from './lib/api';
import { AppChrome } from './components/chrome/AppChrome';
import { TerminalCanvas } from './components/terminal/TerminalCanvas';
import { SettingsDrawer } from './components/settings/SettingsDrawer';

const firstTab = { id: 'tab-1', title: 'PowerShell', cwd: '~' };

function makeTab(cwd: string, index: number) {
  return { id: `tab-${Date.now()}-${index}`, title: index === 1 ? 'PowerShell' : `PowerShell ${index}`, cwd };
}

export default function App() {
  const [backend, setBackend] = useState('starting');
  const [cwd, setCwd] = useState('~');
  const [tabs, setTabs] = useState([firstTab]);
  const [activeTabId, setActiveTabId] = useState(firstTab.id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const preventMenu = (event) => event.preventDefault();
    document.addEventListener('contextmenu', preventMenu);
    backendStatus().then(setBackend).catch(() => setBackend('local preview'));
    getAppState().then((state) => {
      const nextCwd = String(state.cwd ?? '~');
      setCwd(nextCwd);
      setTabs([{ ...firstTab, cwd: nextCwd }]);
    }).catch(() => undefined);
    listModelProfiles().then((items) => {
      setProfiles(items);
      setSelectedProfileId(String(items[0]?.id ?? ''));
    }).catch((err) => {
      setProfiles([]);
      setError(String(err));
    });
    return () => document.removeEventListener('contextmenu', preventMenu);
  }, []);

  function newTab() {
    setTabs((current) => {
      const next = makeTab(cwd, current.length + 1);
      setActiveTabId(next.id);
      setError('');
      return [...current, next];
    });
  }

  function closeTab(id: string) {
    setTabs((current) => {
      if (current.length === 1) return current;
      const next = current.filter((tab) => tab.id !== id);
      if (activeTabId === id) setActiveTabId(next[0].id);
      return next;
    });
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
        onCloseTab={closeTab}
        onToggleSettings={() => setSettingsOpen((open) => !open)}
      />
      <section className="terminal-shell">
        <TerminalCanvas sessionId={activeTabId} result={null} error={error} />
      </section>
      <SettingsDrawer open={settingsOpen} cwd={cwd} profiles={profiles} selectedProfileId={selectedProfileId} onSelectProfile={setSelectedProfileId} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
