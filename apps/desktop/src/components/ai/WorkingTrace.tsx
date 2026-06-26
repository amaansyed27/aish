import type { ModelRunResult } from '../../lib/api';

interface WorkingTraceProps {
  result: ModelRunResult | null;
  selectedProfileId: string;
}

export function WorkingTrace({ result, selectedProfileId }: WorkingTraceProps) {
  if (!result) return null;

  return (
    <details className="working-trace">
      <summary>Working</summary>
      <div className="trace-grid">
        <span>Model</span>
        <code>{selectedProfileId || 'none'}</code>
        <span>Status</span>
        <code>{String(result.ok)}</code>
        <span>Runtime</span>
        <code>{String(result.command_line ?? '')}</code>
      </div>
      {result.error && <pre>{String(result.error).trim()}</pre>}
    </details>
  );
}
