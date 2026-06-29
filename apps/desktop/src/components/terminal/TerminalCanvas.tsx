import type { ModelRunResult } from '../../lib/api';
import { WelcomeMark } from './WelcomeMark';

interface TerminalCanvasProps {
  cwd: string;
  result: ModelRunResult | null;
  error: string;
  lastIntent: string;
  busy: boolean;
}

function resultText(result: ModelRunResult | null) {
  if (!result) return '';
  const out = String(result.output ?? '').trim();
  const err = String(result.error ?? '').trim();
  return out || err || 'No response returned.';
}

export function TerminalCanvas(props: TerminalCanvasProps) {
  const hasContent = Boolean(props.result || props.error || props.busy);
  const request = props.lastIntent ? `> ${props.lastIntent}` : '> ask AiSH';

  return (
    <section className="terminal-canvas" onContextMenu={(event) => event.preventDefault()}>
      {!hasContent && <WelcomeMark cwd={props.cwd} />}
      {props.busy && (
        <article className="command-block">
          <div className="block-meta">AiSH</div>
          <pre>{request}{'\n'}Thinking...</pre>
        </article>
      )}
      {props.error && (
        <article className="command-block error-block">
          <div className="block-meta">AiSH</div>
          <pre>{request}{'\n'}{props.error}</pre>
        </article>
      )}
      {props.result && (
        <article className="command-block">
          <div className="block-meta">AiSH</div>
          <pre>{request}{'\n'}{resultText(props.result)}</pre>
        </article>
      )}
    </section>
  );
}
