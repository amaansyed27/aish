import { useEffect, useRef } from 'react';
import { WelcomeMark } from './WelcomeMark';

function compactOutput(value: unknown) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]*\n[ \t]+Directory:/g, '\nDirectory:')
    .replace(/\n[ \t]+Directory:/g, '\nDirectory:')
    .trimEnd();
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
        const rows = [];
        if (entry.command) rows.push(entry.command);
        if (entry.status === 'running') rows.push('AiSH is thinking...');
        if (entry.output) rows.push(compactOutput(entry.output));
        if (entry.error) rows.push(compactOutput(entry.error));
        if (entry.status === 'blocked' && entry.reason) rows.push(`held: ${entry.reason}`);
        return (
          <div key={entry.id} className={`terminal-entry status-${entry.status}`}>
            <div className="terminal-prompt"><span>PS</span> {cwd} {'>'} <strong>{entry.intent}</strong></div>
            <pre>{rows.filter(Boolean).join('\n').trimEnd()}</pre>
          </div>
        );
      })}
    </section>
  );
}
