const AISH_MARK = String.raw`
 █████╗ ██╗███████╗██╗  ██╗
██╔══██╗██║██╔════╝██║  ██║
███████║██║███████╗███████║
██╔══██║██║╚════██║██╔══██║
██║  ██║██║███████║██║  ██║
╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝
`;

export function WelcomeMark({ cwd }: { cwd: string }) {
  return (
    <div className="welcome-mark-wrap">
      <pre className="welcome-mark">{AISH_MARK}</pre>
      <div className="welcome-copy">
        <strong>AI-native shell</strong>
        <span className="welcome-cwd">{cwd || '~'}</span>
        <span>Type a request. AiSH will inspect context only when needed, run through Ken, and show what it did.</span>
      </div>
    </div>
  );
}
