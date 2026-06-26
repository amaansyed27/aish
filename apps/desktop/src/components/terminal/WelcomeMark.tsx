const AISH_MARK = String.raw`
 █████╗ ██╗███████╗██╗  ██╗
██╔══██╗██║██╔════╝██║  ██║
███████║██║███████╗███████║
██╔══██║██║╚════██║██╔══██║
██║  ██║██║███████║██║  ██║
╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝
`;

export function WelcomeMark() {
  return (
    <div className="welcome-mark-wrap">
      <pre className="welcome-mark">{AISH_MARK}</pre>
      <div className="welcome-copy">
        <strong>AI-native shell</strong>
        <span>Type a request. AiSH will inspect context only when needed, generate a run plan, and show what it did.</span>
      </div>
    </div>
  );
}
