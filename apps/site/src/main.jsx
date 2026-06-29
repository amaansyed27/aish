import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const releaseBase = 'https://github.com/amaansyed27/aish/releases/latest';
const downloadBase = `${releaseBase}/download`;

function Mascot() {
  return (
    <div className="mascot" aria-hidden="true">
      <div className="prompt-mark">{'>'}_</div>
      <span className="eye left" />
      <span className="eye right" />
      <span className="smile" />
    </div>
  );
}

function TerminalPanel() {
  return (
    <div className="terminal-panel">
      <div className="terminal-top"><span /><span /><span /><b>aish</b></div>
      <pre>{`$ aish
AiSH provider shell
Copyright (c) 2026 Dawnlight Labs

ask: clean my repo safely
plan: inspect first, approve before mutations`}</pre>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Dawnlight Labs pilot project</p>
        <h1>An AI-native shell that still feels like a real terminal.</h1>
        <p className="lead">AiSH brings local AI command generation, approval gates, provider-shell workflows, and a cinematic desktop terminal into one developer surface.</p>
        <div className="hero-actions">
          <a className="primary" href="/downloads/">Download AiSH</a>
          <a className="secondary" href="#product">Explore product</a>
        </div>
        <div className="status-row"><span>Local-first model path</span><span>Risk-gated execution</span><span>Desktop + provider shell</span></div>
      </div>
      <div className="hero-visual"><Mascot /><TerminalPanel /></div>
    </section>
  );
}

function Card({ tag, title, children }) {
  return <article className="card"><span className="pill">{tag}</span><h2>{title}</h2><p>{children}</p></article>;
}

function Home() {
  return (
    <>
      <Hero />
      <section id="product" className="grid section">
        <Card tag="01" title="AI Run mode">Type intent, get shell actions. AiSH keeps the final terminal output clean and avoids dumping raw model traces into the shell.</Card>
        <Card tag="02" title="Local-first Ken">The pilot build targets a local Qwen2.5 Coder GGUF profile with a small command-card interface and explicit model status.</Card>
        <Card tag="03" title="Approval gates">Read-only commands can run quickly. Mutating, destructive, or system-impacting actions wait for explicit approval.</Card>
      </section>
      <section id="architecture" className="split section">
        <div><p className="eyebrow">Architecture</p><h2>A provider shell and desktop terminal built as a launch product.</h2><p>AiSH ships as a desktop terminal for controlled AI workflows and as a provider shell for terminal-native usage. Windows, macOS, and Linux bundles are produced through GitHub Actions.</p></div>
        <div className="stack"><div>Windows MSI + provider shell</div><div>macOS DMG + provider shell</div><div>Linux DEB, RPM, AppImage</div><div>Static landing site on Vercel</div></div>
      </section>
    </>
  );
}

function Downloads() {
  const downloads = [
    ['WIN', 'Windows', 'MSI desktop installer plus provider shell executable.', `${downloadBase}/aish-windows.zip`],
    ['MAC', 'macOS', 'DMG desktop installer plus provider shell binary. Public launch builds should be signed and notarized.', `${downloadBase}/aish-macos.zip`],
    ['LIN', 'Linux', 'DEB, RPM, AppImage, and provider shell binary.', `${downloadBase}/aish-linux.zip`]
  ];
  return (
    <>
      <section className="page-hero section"><p className="eyebrow">Downloads</p><h1>Install AiSH on Windows, macOS, and Linux.</h1><p className="lead">Release builds are published from GitHub Releases. Pick your platform archive, then use the installer or provider shell binary inside it.</p><div className="hero-actions"><a className="primary" href={releaseBase}>Open latest release</a><a className="secondary" href="https://github.com/amaansyed27/aish/releases">All releases</a></div></section>
      <section className="grid section">{downloads.map(([tag, title, text, href]) => <article className="card" key={title}><span className="pill">{tag}</span><h2>{title}</h2><p>{text}</p><a className="secondary download-link" href={href}>Download {title}</a></article>)}</section>
    </>
  );
}

function Layout() {
  const page = window.location.pathname.startsWith('/downloads') ? 'downloads' : 'home';
  return (
    <div>
      <div className="bg-grid" aria-hidden="true" />
      <header className="nav"><a className="brand" href="/"><span className="brand-mark">Ai</span><span>AiSH</span></a><nav><a href="/#product">Product</a><a href="/#architecture">Architecture</a><a href="/downloads/">Downloads</a><a href="https://github.com/amaansyed27/aish">GitHub</a></nav></header>
      <main>{page === 'downloads' ? <Downloads /> : <Home />}</main>
      <footer><span>AiSH by Dawnlight Labs</span><span>2026 Dawnlight Labs</span></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Layout />);
