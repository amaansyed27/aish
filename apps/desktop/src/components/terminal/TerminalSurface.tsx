import { useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { openPty, resizePty, sendPty } from '../../lib/api';

interface TerminalOutputEvent {
  session_id: string;
  data: string;
}

export function TerminalSurface({ sessionId, isActive = true }: { sessionId: string; isActive?: boolean; modelOutput?: unknown; error?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily: 'Cascadia Mono, CaskaydiaCove Nerd Font, Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.15,
      scrollback: 10000,
      theme: {
        background: '#0c0c0c',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        selectionBackground: '#555555',
      },
    });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(hostRef.current);
    fit.fit();
    terminal.focus();
    termRef.current = terminal;
    fitRef.current = fit;

    openPty(sessionId, terminal.cols || 120, terminal.rows || 30).catch((err) => terminal.writeln(String(err)));

    const dataDisposable = terminal.onData((data) => {
      void sendPty(sessionId, data);
    });

    let unlisten: null | (() => void) = null;
    listen<TerminalOutputEvent>('terminal-output', (event) => {
      if (event.payload.session_id === sessionId) {
        terminal.write(event.payload.data);
      }
    }).then((fn) => { unlisten = fn; }).catch(() => undefined);

    const resize = () => {
      fit.fit();
      void resizePty(sessionId, terminal.cols || 120, terminal.rows || 30);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(hostRef.current);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (unlisten) unlisten();
      dataDisposable.dispose();
      terminal.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!isActive) return;
    window.setTimeout(() => {
      const terminal = termRef.current;
      const fit = fitRef.current;
      if (!terminal || !fit) return;
      fit.fit();
      terminal.focus();
      void resizePty(sessionId, terminal.cols || 120, terminal.rows || 30);
    }, 40);
  }, [isActive, sessionId]);

  return (
    <div className="xterm-shell" onContextMenu={(event) => event.preventDefault()}>
      <div className="xterm-host" ref={hostRef} onClick={() => termRef.current?.focus()} />
    </div>
  );
}
