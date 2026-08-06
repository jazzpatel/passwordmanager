import { useState, useRef } from 'react'

export default function AuthOverlay({ authStatus, onAuth }) {
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = async () => {
    if (!pwd || loading) return
    setLoading(true)
    await onAuth(pwd)
    setLoading(false)
    setPwd('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div id="auth-overlay">
      <div id="auth-card">
        <svg className="auth-logo" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="76" height="76" rx="20" fill="#0a84ff" />
          <rect x="23" y="34" width="30" height="23" rx="5.5" fill="white" />
          <path d="M28 34V27C28 22.582 31.582 19 36 19H40C44.418 19 48 22.582 48 27V34"
            stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="45.5" r="3.5" fill="#0a84ff" />
        </svg>
        <h2>KeyVault Manager</h2>
        <p className="auth-sub">Enter your master password to unlock</p>

        <div
          id="auth-status"
          className={authStatus.type ? `visible ${authStatus.type}` : ''}
        >
          {authStatus.msg}
        </div>

        <input
          ref={inputRef}
          type="password"
          id="master-password"
          placeholder="Master Password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <button id="btn-unlock" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Unlocking…' : 'Unlock Vault'}
        </button>
        <p className="auth-note">🔒 Encrypted locally · AES-256-GCM · PBKDF2</p>
      </div>
    </div>
  )
}
