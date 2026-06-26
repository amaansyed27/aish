import type { ModelProfile } from '../../lib/api';

interface AppChromeProps {
  backendStatus: string;
  cwd: string;
  tabs: Array<{ id: string; title: string; cwd: string }>;
  activeTabId: string;
  profiles: ModelProfile[];
  selectedProfileId: string;
  settingsOpen: boolean;
  onSelectProfile: (id: string) => void;
  onNewTab: () => void;
  onSelectTab: (id: string) => void;
  onToggleSettings: () => void;
}

function shortPath(path: string) {
  if (!path) return '~';
  const normalized = path.replaceAll('\\', '/');
  const parts = normalized.split('/').filter(Boolean);
  return parts.slice(-2).join('/') || normalized;
}

export function AppChrome({ backendStatus, cwd, tabs, activeTabId, profiles, selectedProfileId, settingsOpen, onSelectProfile, onNewTab, onSelectTab, onToggleSettings }: AppChromeProps) {
  return (
    <header className="app-chrome">
      <div className="chrome-left">
        <div className="app-badge">Ai</div>
        <div className="tab-row">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className={tab.id === activeTabId ? 'tab active-tab' : 'tab'} onClick={() => onSelectTab(tab.id)}>
              <span>{tab.title}</span>
              <small>{shortPath(tab.cwd)}</small>
            </button>
          ))}
          <button className="tab add-tab" type="button" title="New tab" onClick={onNewTab}>+</button>
        </div>
      </div>

      <div className="chrome-right">
        <span className="cwd-chip">{shortPath(cwd)}</span>
        <select className="model-chip" value={selectedProfileId} onChange={(event) => onSelectProfile(event.target.value)}>
          {profiles.map((profile) => (
            <option key={String(profile.id)} value={String(profile.id)}>{String(profile.label ?? profile.id)}</option>
          ))}
        </select>
        <button className={settingsOpen ? 'icon-button active-icon' : 'icon-button'} type="button" title="Settings" onClick={onToggleSettings}>⚙</button>
        <span className="chip muted">{backendStatus}</span>
      </div>
    </header>
  );
}
