import { forwardRef } from 'react';

interface CommandComposerProps {
  value: string;
  cwd: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

function shortPath(path: string) {
  if (!path) return '~';
  const normalized = path.replaceAll('\\', '/');
  const parts = normalized.split('/').filter(Boolean);
  return parts.slice(-2).join('/') || normalized;
}

export const CommandComposer = forwardRef<HTMLInputElement, CommandComposerProps>(function CommandComposer({ value, cwd, disabled, onChange, onSubmit }, ref) {
  return (
    <form className="composer" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <span className="prompt">PS {shortPath(cwd)}&gt;</span>
      <input
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ask AiSH to run a command..."
        autoFocus
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
      />
      <span className="shortcut-hint">Ctrl+Space</span>
      <button type="submit" disabled={disabled}>{disabled ? 'Running' : 'Run'}</button>
    </form>
  );
});
