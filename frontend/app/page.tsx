"use client";

import { FormEvent, useState } from "react";

type Token = "cUSD" | "cEUR";
type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const TOKENS: Record<Token, { symbol: string; name: string }> = {
  cUSD: { symbol: "$", name: "Confidential USD" },
  cEUR: { symbol: "€", name: "Confidential EUR" },
};

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
  const [walletAddress, setWalletAddress] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [token, setToken] = useState<Token>("cUSD");
  const [balances, setBalances] = useState<Record<Token, number>>({ cUSD: 0, cEUR: 0 });
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [activity, setActivity] = useState<string[]>([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("");

  async function connectWallet() {
    const ethereum = (window as typeof window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) {
      setNotice("MetaMask was not found. Install a browser wallet to connect.");
      return;
    }
    try {
      const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
      setWalletAddress(accounts[0] ?? "");
      setConnected(Boolean(accounts[0]));
      setNotice("Wallet connected. Demo token actions are now available.");
      try {
        await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x66eee" }] });
      } catch {
        setNotice("Wallet connected. Switch to Arbitrum Sepolia for future on-chain actions.");
      }
    } catch {
      setNotice("Wallet connection was cancelled.");
    }
  }

  async function claimTokens() {
    if (!connected) {
      setNotice("Connect your wallet before using the demo faucet.");
      return;
    }
    setFaucetLoading(true);
    setNotice("Encrypting demo token allocation...");
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setBalances((current) => ({ ...current, [token]: current[token] + 1000 }));
    setActivity((current) => [`Faucet · +1,000 ${token}`, ...current].slice(0, 3));
    setNotice(`1,000 demo ${token} added locally. No on-chain tokens were minted.`);
    setFaucetLoading(false);
  }

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
    if (Number(amount) > balances[token]) {
      setNotice(`Insufficient demo ${token} balance. Use the faucet first.`);
      return;
    }
    setBalances((current) => ({ ...current, [token]: current[token] - Number(amount) }));
    setActivity((current) => [`Private send · −${Number(amount).toLocaleString()} ${token}`, ...current].slice(0, 3));
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
          <button className="wallet-button" onClick={connectWallet}>
            {connected ? <><span className="wallet-dot" />{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</> : "Connect wallet"}
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
              <div className={revealed ? "balance-number" : "balance-number blurred"}>{revealed ? `${TOKENS[token].symbol} ${balances[token].toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `${TOKENS[token].symbol} ••••••••`}</div>
              <button className="reveal-button" onClick={() => setRevealed((value) => !value)}>
                <EyeIcon crossed={revealed} /> {revealed ? "Hide" : "Reveal"}
              </button>
            </div>
            <div className="token-row"><span className="token-icon">{TOKENS[token].symbol}</span><span>{token}</span><span className="encrypted-tag">Encrypted</span></div>

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
                <button type="button" onClick={() => setAmount(String(balances[token]))}>MAX</button>
                <span className="currency-name">{token}</span>
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

      <section className="token-lab wrap" id="tokens">
        <div className="lab-copy">
          <span className="section-kicker">TESTNET LAB</span>
          <h2>Try confidential tokens.</h2>
          <p>Choose a demo asset, claim a local test balance, then send a private payment from the wallet above.</p>
          <div className="demo-warning"><span>i</span><div><b>Local demo faucet</b><p>This faucet simulates minting in your browser. It does not issue real or on-chain assets.</p></div></div>
        </div>
        <div className="faucet-card">
          <header><div><span className="faucet-icon">⌁</span><div><b>Token faucet</b><small>ARBITRUM SEPOLIA · DEMO</small></div></div><span className="live-pill"><i /> Ready</span></header>
          <div className="token-tabs">
            {(Object.keys(TOKENS) as Token[]).map((item) => (
              <button key={item} className={token === item ? "active" : ""} onClick={() => setToken(item)}>
                <span>{TOKENS[item].symbol}</span><div><b>{item}</b><small>{TOKENS[item].name}</small></div>
              </button>
            ))}
          </div>
          <div className="claim-row"><div><small>FAUCET AMOUNT</small><strong>1,000 {token}</strong></div><button onClick={claimTokens} disabled={faucetLoading}>{faucetLoading ? "Claiming..." : "Claim test tokens"}</button></div>
          <div className="mini-activity">
            <div className="activity-heading"><span>RECENT DEMO ACTIVITY</span><span>{activity.length} EVENTS</span></div>
            {activity.length ? activity.map((item, index) => <div className="activity-item" key={`${item}-${index}`}><span className="activity-check">✓</span><span>{item}</span><time>just now</time></div>) : <div className="empty-activity">Connect a wallet and claim tokens to begin.</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
