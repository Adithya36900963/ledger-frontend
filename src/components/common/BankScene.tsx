import { tiltHandlers } from './tilt'

const blocks = [
  { id: '0041', hash: '9f3a…c1d2', note: 'Deposit · balanced' },
  { id: '0042', hash: 'b71e…04aa', note: 'Transfer · balanced' },
  { id: '0043', hash: '3c8d…e9f7', note: 'Withdrawal · balanced' },
]

export function BankScene() {
  return <div className="scene3d" aria-hidden="true" {...tiltHandlers(14)}>
    <div className="scene-floor" />
    <div className="scene-stage">
      <div className="chain-line" />
      {blocks.map((b, i) => <div key={b.id} className={`ledger-block lb-${i}`}>
        <span className="lb-id">BLOCK #{b.id}</span><span className="lb-hash">{b.hash}</span><span className="lb-note">✓ {b.note}</span>
      </div>)}
      <div className="card-float"><div className="bank-card">
        <div className="bc-top"><b>LedgerLine</b><span>◈ SECURE</span></div>
        <div className="bc-chip" />
        <div className="bc-number">4417 •••• •••• 2026</div>
        <div className="bc-bottom"><span>ACCOUNT HOLDER</span><span>11/29</span></div>
        <div className="bc-shine" />
      </div></div>
      <div className="coin coin-a">◈</div><div className="coin coin-b">◈</div><div className="coin coin-c">◈</div>
    </div>
  </div>
}
