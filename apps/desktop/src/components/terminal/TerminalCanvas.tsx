import type { ModelRunResult } from '../../lib/api';
import { WelcomeMark } from './WelcomeMark';

interface TerminalCanvasProps {
  cwd: string;
  result: ModelRunResult | null;
  error: string;
}

export function TerminalCanvas({ cwd, result, error }: TerminalCanvasProps) {
  const hasResult = Boolean(result || error);

  return (
    <section className="terminal-canvas">
      {!hasResult && <WelcomeMark cwd={cwd} />}

      {error && (
        <article className="command-block error-block">
          <div className="block-meta">AiSH</div>
          <pre>{error}</pre>
        </article>
      )}

      {result && (
        <article className="command-block">
          <div className="block-meta">AI Run result</div>
          <pre>{String(result.output ?? '').trim() || String(result.error ?? '').trim() || 'No output returned.'}</pre>
        </article>
      )}
    </section>
  );
}
