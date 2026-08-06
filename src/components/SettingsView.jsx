import { useState } from 'react'
import { loadSettings } from '../utils/helpers.js'
import { TIMEOUT_OPTIONS } from '../constants/index.js'

export default function SettingsView({ onSaveAutoLock, onChangePassword }) {
  const [timeout, setTimeout_] = useState(String(loadSettings().autoLockMinutes ?? 15))
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confPass, setConfPass] = useState('')
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [loading, setLoading] = useState(false)
  const [showCur, setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConf, setShowConf] = useState(false)

  const handleChangePass = async () => {
    setLoading(true)
    const result = await onChangePassword(curPass, newPass, confPass)
    setLoading(false)
    if (result.error) {
      setStatus({ type: 'error', msg: result.error })
    } else {
      setStatus({ type: 'success', msg: '✅  Master password changed successfully!' })
      setCurPass(''); setNewPass(''); setConfPass('')
      setTimeout(() => setStatus({ type: '', msg: '' }), 5000)
    }
  }

  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  return (
    <div id="settings-view">
      <div className="settings-title">Settings</div>

      <div className="settings-section">
        <h3>⏱&nbsp; Auto-lock Timeout</h3>
        <p>Automatically lock the vault after a period of inactivity. The timer resets whenever you interact with the page.</p>
        <div className="timeout-row">
          <select className="form-inp" value={timeout}
            onChange={(e) => { setTimeout_(e.target.value); onSaveAutoLock(parseInt(e.target.value, 10)) }}>
            {TIMEOUT_OPTIONS.map((o) => (
              <option key={o.value} value={String(o.value)}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>🔑&nbsp; Change Master Password</h3>
        <p>Verify your current password first. The vault is immediately re-encrypted with the new password — no data is lost. New password must be at least 8 characters.</p>

        <div className={`settings-status${status.type ? ` visible ${status.type}` : ''}`}>
          {status.msg}
        </div>

        <div className="form-group">
          <label className="form-lbl">Current Password</label>
          <div className="pass-wrap">
            <input className="form-inp" type={showCur ? 'text' : 'password'}
              placeholder="Enter current password" value={curPass} onChange={(e) => setCurPass(e.target.value)} />
            <button className="pass-toggle" type="button" onClick={() => setShowCur((v) => !v)}><EyeIcon /></button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-lbl">New Password</label>
          <div className="pass-wrap">
            <input className="form-inp" type={showNew ? 'text' : 'password'}
              placeholder="Min 8 characters" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            <button className="pass-toggle" type="button" onClick={() => setShowNew((v) => !v)}><EyeIcon /></button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-lbl">Confirm New Password</label>
          <div className="pass-wrap">
            <input className="form-inp" type={showConf ? 'text' : 'password'}
              placeholder="Repeat new password" value={confPass} onChange={(e) => setConfPass(e.target.value)} />
            <button className="pass-toggle" type="button" onClick={() => setShowConf((v) => !v)}><EyeIcon /></button>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-primary" onClick={handleChangePass} disabled={loading}>
            {loading ? 'Updating…' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  )
}
