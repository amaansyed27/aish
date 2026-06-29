import { useEffect, useRef } from 'react';
import { WelcomeMark } from './WelcomeMark';

function compactOutput(value: unknown) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]*\n[ \t]+Directory:/g, '\nDirectory:')
    .replace(/\n[ \t]+Directory:/g, '\nDirectory:')
    .trimEnd();
}

function detailText(entry: any) {
  const rows = [];
  rows.push(`request: ${entry.intent || ''}`);
  if (entry.command) rows.push(`shell: ${entry.command}`);
  if (entry.risk) rows.push(`risk: ${entry.risk}`);
  if (entry.reason) rows.push(`reason: ${entry.reason}`);
  rows.push(`status: ${entry.status || 'done'}`);
  return rows.join('\n');
}

export function TerminalCanvas(props: any) {
  const entries = props.entries || [];
  const cwd = String(props.cwd || '~').replace(/\\/g, '/').split('/').slice(-2).join('/');
  const hasContent = entries.length > 0;
  const scrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [entries.length, entries[entries.length - 1]?.output, entries[entries.length - 1]?.error]);

  return (
    <section ref={scrollRef} className="terminal-canvas" onContextMenu={(event) => event.preventDefault()}>
      {!hasContent && <WelcomeMark cwd={props.cwd} />}
      {entries.map((entry: any) => {
        const main = [];
        if (entry.status === 'running') main.push('AiSH is working...');
        if (entry.output) main.push(compactOutput(entry.output));
        if (entry.error) main.push(compactOutput(entry.error));
        if (!main.length && entry.status !== 'running') main.push('(no output)');
        return (
          <div key={entry.id} className={`terminal-entry status-${entry.status}`}>
            <div className="terminal-prompt"><span>PS</span> {cwd} {'>'} <strong>{entry.intent}</strong></div>
            <pre>{main.filter(Boolean).join('\n').trimEnd()}</pre>
            {(entry.command || entry.reason || entry.risk || entry.status === 'running') && (
              <details className="entry-working">
                <summary>Working</summary>
                <pre>{detailText(entry)}</pre>
              </details>
            )}
          </div>
        );
      })}
    </section>
  );
}
