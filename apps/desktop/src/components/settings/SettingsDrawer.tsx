import type { ModelProfile } from '../../lib/api';

interface SettingsDrawerProps {
  open: boolean;
  cwd: string;
  profiles: ModelProfile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onClose: () => void;
}

export function SettingsDrawer({ open, cwd, profiles, selectedProfileId, onSelectProfile, onClose }: SettingsDrawerProps) {
  if (!open) return null;

  return (
    <aside className="settings-drawer">
      <div className="drawer-header">
        <strong>Settings</strong>
        <button type="button" onClick={onClose}>×</button>
      </div>
      <label className="settings-field">
        <span>Model</span>
        <select value={selectedProfileId} onChange={(event) => onSelectProfile(event.target.value)}>
          {profiles.map((profile) => (
            <option key={String(profile.id)} value={String(profile.id)}>{String(profile.label ?? profile.id)}</option>
          ))}
        </select>
      </label>
      <div className="settings-field">
        <span>Directory</span>
        <code>{cwd || '~'}</code>
      </div>
      <div className="settings-note">
        Normal, cached history completion, and Ken mode will move behind the future Tab shortcut. For now AiSH stays in simple AI Run mode.
      </div>
    </aside>
  );
}
