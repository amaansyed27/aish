export function WorkingTrace(props: any) {
  if (!props.result && !props.error) return null;
  return (
    <details className="working-trace">
      <summary>Working</summary>
      {props.error && <pre>{props.error}</pre>}
      {props.result && (
        <div className="trace-grid">
          <span>Runtime</span><code>{String(props.result.command_line ?? 'local model')}</code>
          <span>Status</span><code>{props.result.ok ? 'ok' : 'error'}</code>
        </div>
      )}
    </details>
  );
}
