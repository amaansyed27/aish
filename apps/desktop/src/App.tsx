import { useEffect, useMemo, useState } from 'react';
import type { AiSubmode, AppState, CachePolicy, CommandTrace, ContextLevel, Mode, SuggestionItem } from './types';
import { backendStatus, complete, createAiCard, executeShellCommand, inspectProject, listModelProfiles, saveModelProfiles, type ModelProfile, type ModelRunResult } from './lib/api';
import { TerminalSurface } from './components/TerminalSurface';
import { SegmentButton } from './components/SegmentButton';
import { TracePanel } from './components/TracePanel';
import { ModelPanel } from './components/ModelPanel';

const initialState: AppState = {
  mode: 'history',
  aiSubmode: 'suggest',
  contextLevel: 'project',
  cachePolicy: 'project_only',
  shell: 'PowerShell',
  cwd: '~',
};

function modeLabel(mode: Mode, aiSubmode: AiSubmode) {
  if (mode === 'ai') return `AI: ${aiSubmode === 'run' ? 'Run' : 'Suggest'}`;
  return mode === 'history' ? 'History' : 'Normal';
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [input, setInput] = useState('');
  const [backend, setBackend] = useState('backend not checked');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [trace, setTrace] = useState<CommandTrace | null>(null);
  const [project, setProject] = useState<Record<string, unknown>>({});
  const [profiles, setProfiles] = useState<ModelProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [modelOutput, setModelOutput] = useState<ModelRunResult | null>(null);

  const visibleSuggestions = useMemo(() => {
    if (state.mode === 'normal') return [];
    return suggestions.slice(0, 6);
  }, [suggestions, state.mode]);

  useEffect(() => {
    backendStatus().then(setBackend).catch(() => setBackend('frontend preview'));
    inspectProject().then(setProject).catch(() => setProject({}));
    listModelProfiles()
      .then((items) => {
        setProfiles(items);
        setSelectedProfileId(String(items[0]?.id ?? ''));
      })
      .catch(() => setProfiles([]));
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      complete(input).then(setSuggestions).catch(() => setSuggestions([]));
    }, 120);
    return () => window.clearTimeout(handle);
  }, [input]);

  const setMode = (mode: Mode) => setState((prev) => ({ ...prev, mode }));
  const setAiSubmode = (aiSubmode: AiSubmode) => setState((prev) => ({ ...prev, aiSubmode, mode: 'ai' }));
  const setContextLevel = (contextLevel: ContextLevel) => setState((prev) => ({ ...prev, contextLevel }));
  const setCachePolicy = (cachePolicy: CachePolicy) => setState((prev) => ({ ...prev, cachePolicy }));

  async function submitInput() {
    const text = input.trim();
    if (!text) return;

    if (state.mode === 'ai') {
      if (!selectedProfileId) {
        setTrace({ intent: text, cardType: 'fallback', risk: 'low', contextUsed: ['model profile'], commands: [], safetyDecision: 'No model profile selected.' });
        return;
      }
      const result = await createAiCard(selectedProfileId, text);
      setModelOutput(result);
      return;
    }

    const result = await executeShellCommand(text, false);
    setTrace(result);
  }

  async function persistProfiles(next: ModelProfile[]) {
    const saved = await saveModelProfiles(next);
    setProfiles(saved);
  }

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
          <div className="status-pill muted">{backend}</div>
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

          <ModelPanel profiles={profiles} selectedProfileId={selectedProfileId} onSelect={setSelectedProfileId} onSave={persistProfiles} />
        </aside>

        <section className="terminal-frame">
          <div className="terminal-header">
            <div><span className="dot" />PowerShell session</div>
            <span className="hint">Warp-style blocks · PowerShell-first</span>
          </div>

          <div className="terminal-block">
            <TerminalSurface trace={trace} modelOutput={modelOutput} />
          </div>

          <div className="suggestion-strip">
            {visibleSuggestions.map((suggestion) => (
              <button key={suggestion.command} className="suggestion" onClick={() => setInput(suggestion.command)}>
                <strong>{suggestion.command}</strong>
                <span>{suggestion.description ?? suggestion.label} · {suggestion.source} · {suggestion.risk}</span>
              </button>
            ))}
          </div>

          <label className="input-row">
            <span>PS</span>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a command or AI request…" onKeyDown={(event) => { if (event.key === 'Enter') void submitInput(); }} />
            <button type="button" onClick={() => void submitInput()}>{state.mode === 'ai' && state.aiSubmode === 'run' ? 'Run' : 'Suggest'}</button>
          </label>

          <TracePanel trace={trace} modelOutput={modelOutput} project={project} />
        </section>
      </section>
    </main>
  );
}
