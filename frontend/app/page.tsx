"use client";

import { FormEvent, useState } from "react";

const LockIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="5" y="10" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const EyeIcon = ({ crossed = false }: { crossed?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    {crossed && <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
  </svg>
);

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("");

  function handleTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!connected) {
      setNotice("Connect your wallet to continue.");
      return;
    }
    if (!recipient || !amount || Number(amount) <= 0) {
      setNotice("Enter a valid recipient and amount.");
      return;
    }
    setNotice("Demo transfer encrypted locally — no on-chain transaction was sent.");
    setRecipient("");
    setAmount("");
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <nav className="nav wrap" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="PrivatePay home">
          <span className="brand-mark"><LockIcon size={20} /></span>
          <span>PrivatePay</span>
        </a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#privacy">Privacy</a>
          <span className="network"><i /> Arbitrum Sepolia</span>
          <button className="wallet-button" onClick={() => setConnected((value) => !value)}>
            {connected ? <><span className="wallet-dot" />0x71F...29A</> : "Connect wallet"}
          </button>
        </div>
      </nav>

      <section className="hero wrap" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span>✦</span> Powered by Fhenix CoFHE</div>
          <h1><span>Payments should be</span><em>private by default.</em></h1>
          <p>
            Send and receive on-chain payments without exposing balances or
            transaction amounts. Encrypted end to end, verifiable on-chain.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#dashboard">Open private wallet <span>→</span></a>
            <a className="text-action" href="#how"><span className="play">▶</span> See how it works</a>
          </div>
          <div className="proof-row">
            <span><b>✓</b> Fully encrypted</span>
            <span><b>✓</b> Non-custodial</span>
            <span><b>✓</b> Selective disclosure</span>
          </div>
        </div>

        <div className="dashboard-wrap" id="dashboard">
          <div className="dashboard-glow" />
          <section className="dashboard-card" aria-label="Private wallet demo">
            <header className="card-header">
              <div><span className="status-dot" /> PRIVATE WALLET</div>
              <button className="icon-button" aria-label="More options">•••</button>
            </header>

            <div className="balance-label"><span>CONFIDENTIAL BALANCE</span><span className="secured"><LockIcon size={13} /> FHE SECURED</span></div>
            <div className="balance-row">
              <div className={revealed ? "balance-number" : "balance-number blurred"}>{revealed ? "$ 12,480.50" : "$ ••••••••"}</div>
              <button className="reveal-button" onClick={() => setRevealed((value) => !value)}>
                <EyeIcon crossed={revealed} /> {revealed ? "Hide" : "Reveal"}
              </button>
            </div>
            <div className="token-row"><span className="token-icon">$</span><span>cUSD</span><span className="encrypted-tag">Encrypted</span></div>

            <div className="divider" />
            <form onSubmit={handleTransfer}>
              <div className="form-title"><div><span className="send-icon">↗</span><b>Send private payment</b></div><span>AMOUNT ENCRYPTED</span></div>
              <label>RECIPIENT ADDRESS</label>
              <div className="input-box">
                <span className="hex-icon">⬡</span>
                <input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x..." aria-label="Recipient address" />
                <button type="button" onClick={() => setRecipient("0x8A92...4F1C")}>Paste</button>
              </div>
              <label>AMOUNT</label>
              <div className="input-box amount-box">
                <span className="currency">$</span>
                <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" inputMode="decimal" aria-label="Payment amount" />
                <button type="button" onClick={() => setAmount("250.00")}>MAX</button>
                <span className="currency-name">cUSD</span>
              </div>
              <button className="transfer-button" type="submit"><LockIcon size={17} /> Encrypt &amp; send privately <span>→</span></button>
              {notice && <p className="notice" role="status">{notice}</p>}
            </form>
            <footer className="card-footer"><span><LockIcon size={13} /> Your data never leaves encrypted state</span><span>Gas ≈ $0.04</span></footer>
          </section>
        </div>
      </section>

      <section className="feature-strip" id="how">
        <div className="wrap feature-grid">
          <article><span className="feature-icon">◈</span><div><h2>Encrypted balances</h2><p>Your holdings remain private, even on a public blockchain.</p></div></article>
          <article><span className="feature-icon">⇄</span><div><h2>Confidential transfers</h2><p>Amounts stay hidden from observers, validators, and explorers.</p></div></article>
          <article id="privacy"><span className="feature-icon">◎</span><div><h2>You control disclosure</h2><p>Reveal only what you choose, to only whom you choose.</p></div></article>
        </div>
      </section>
    </main>
  );
}
