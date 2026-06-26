import { useEffect, useMemo, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { invoke } from '@tauri-apps/api/core';
import type { AiSubmode, AppState, CachePolicy, CommandTrace, ContextLevel, Mode, SuggestionItem } from './types';

const initialState: AppState = {
  mode: 'history',
  aiSubmode: 'suggest',
  contextLevel: 'project',
  cachePolicy: 'project_only',
  shell: 'PowerShell',
  cwd: '~',
};

const demoSuggestions: SuggestionItem[] = [
  { command: 'npm run dev', label: 'Start dev server', source: 'package scripts', risk: 'low', score: 0.92 },
  { command: 'git status --short', label: 'Show changed files', source: 'git', risk: 'low', score: 0.84 },
  { command: 'docker compose ps', label: 'List compose services', source: 'docker compose', risk: 'low', score: 0.75 },
];

const demoTrace: CommandTrace = {
  intent: 'run the current app',
  cardType: 'plan',
  risk: 'medium',
  contextUsed: ['cwd', 'package.json', 'pnpm-lock.yaml', 'scripts'],
  commands: ['pnpm install', 'pnpm run dev'],
  exitCode: undefined,
  durationMs: undefined,
  safetyDecision: 'install requires confirmation; run step is low risk',
};

function modeLabel(mode: Mode, aiSubmode: AiSubmode) {
  if (mode === 'ai') return `AI: ${aiSubmode === 'run' ? 'Run' : 'Suggest'}`;
  return mode === 'history' ? 'History' : 'Normal';
}

function SegmentButton<T extends string>({ value, active, onClick, children }: { value: T; active: T; onClick: (value: T) => void; children: React.ReactNode }) {
  return (
    <button className={value === active ? 'seg active' : 'seg'} onClick={() => onClick(value)}>
      {children}
    </button>
  );
}

function XtermSurface() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: 'Cascadia Mono, CaskaydiaCove Nerd Font, Consolas, monospace',
      fontSize: 13,
      theme: {
        background: '#080b10',
        foreground: '#d5d7de',
        cursor: '#d5d7de',
        selectionBackground: '#263041',
      },
      convertEol: true,
    });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(hostRef.current);
    fit.fit();
    terminal.writeln('AiSH desktop scaffold');
    terminal.writeln('PowerShell PTY bridge is the next implementation step.');
    terminal.write('\r\nPS C:\\Users\\Amaan> ');

    const resize = () => fit.fit();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      terminal.dispose();
    };
  }, []);

  return <div ref={hostRef} className="xterm-host" />;
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [input, setInput] = useState('');
  const [traceOpen, setTraceOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('backend not checked');

  const visibleSuggestions = useMemo(() => {
    if (state.mode === 'normal') return [];
    return demoSuggestions.filter((item) => item.command.startsWith(input.trim()) || input.trim().length < 2);
  }, [input, state.mode]);

  useEffect(() => {
    invoke<string>('backend_status')
      .then(setBackendStatus)
      .catch(() => setBackendStatus('frontend-only preview'));
  }, []);

  const setMode = (mode: Mode) => setState((prev) => ({ ...prev, mode }));
  const setAiSubmode = (aiSubmode: AiSubmode) => setState((prev) => ({ ...prev, aiSubmode, mode: 'ai' }));
  const setContextLevel = (contextLevel: ContextLevel) => setState((prev) => ({ ...prev, contextLevel }));
  const setCachePolicy = (cachePolicy: CachePolicy) => setState((prev) => ({ ...prev, cachePolicy }));

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">Ai</span>
          <div>
            <strong>AiSH</strong>
            <span>{state.shell} · {state.cwd}</span>
          </div>
        </div>

        <div className="toolbar">
          <div className="segment">
            <SegmentButton value="normal" active={state.mode} onClick={setMode}>Normal</SegmentButton>
            <SegmentButton value="history" active={state.mode} onClick={setMode}>History</SegmentButton>
            <SegmentButton value="ai" active={state.mode} onClick={setMode}>AI</SegmentButton>
          </div>
          <div className="status-pill">{modeLabel(state.mode, state.aiSubmode)}</div>
          <div className="status-pill muted">{backendStatus}</div>
        </div>
      </header>

      <section className="workspace">
        <aside className="side-panel">
          <div className="panel-card">
            <h2>AI submode</h2>
            <div className="segment vertical">
              <SegmentButton value="suggest" active={state.aiSubmode} onClick={setAiSubmode}>Suggest</SegmentButton>
              <SegmentButton value="run" active={state.aiSubmode} onClick={setAiSubmode}>Run</SegmentButton>
            </div>
          </div>

          <div className="panel-card">
            <h2>Context</h2>
            <select value={state.contextLevel} onChange={(event) => setContextLevel(event.target.value as ContextLevel)}>
              <option value="off">Off</option>
              <option value="minimal">Minimal</option>
              <option value="project">Project</option>
              <option value="terminal">Terminal</option>
              <option value="selected">Selected</option>
            </select>
          </div>

          <div className="panel-card">
            <h2>Cache</h2>
            <select value={state.cachePolicy} onChange={(event) => setCachePolicy(event.target.value as CachePolicy)}>
              <option value="off">Off</option>
              <option value="project_only">Project only</option>
              <option value="full_local">Full local</option>
            </select>
          </div>
        </aside>

        <section className="terminal-frame">
          <div className="terminal-header">
            <div>
              <span className="dot" />
              PowerShell session
            </div>
            <span className="hint">Warp-style blocks · PowerShell-first</span>
          </div>

          <div className="terminal-block">
            <XtermSurface />
          </div>

          <div className="suggestion-strip">
            {visibleSuggestions.map((suggestion) => (
              <button key={suggestion.command} className="suggestion" onClick={() => setInput(suggestion.command)}>
                <strong>{suggestion.command}</strong>
                <span>{suggestion.label} · {suggestion.source} · {suggestion.risk}</span>
              </button>
            ))}
          </div>

          <label className="input-row">
            <span>PS</span>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a command or AI request…" />
            <button>{state.mode === 'ai' && state.aiSubmode === 'run' ? 'Run' : 'Suggest'}</button>
          </label>

          <section className="trace-card">
            <button className="trace-toggle" onClick={() => setTraceOpen((open) => !open)}>
              <span>Working</span>
              <small>Command Trace · {demoTrace.risk}</small>
            </button>
            {traceOpen && (
              <div className="trace-body">
                <p><b>Intent:</b> {demoTrace.intent}</p>
                <p><b>Card:</b> {demoTrace.cardType}</p>
                <p><b>Context:</b> {demoTrace.contextUsed.join(', ')}</p>
                <p><b>Safety:</b> {demoTrace.safetyDecision}</p>
                <pre>{demoTrace.commands.join('\n')}</pre>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
