import { useState, useEffect } from 'react'
import { CATEGORIES } from '../constants/index.js'

export default function FormView({ editingCred, folders, defaultFolderId, onSave, onCancel, onDelete }) {
  const [site, setSite] = useState('')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Other')
  const [notes, setNotes] = useState('')
  const [folderId, setFolderId] = useState('')
  const [passVisible, setPassVisible] = useState(false)

  useEffect(() => {
    if (editingCred) {
      setSite(editingCred.site || '')
      setUser(editingCred.user || '')
      setPass(editingCred.pass || '')
      setUrl(editingCred.url || '')
      setCategory(editingCred.category || 'Other')
      setNotes(editingCred.notes || '')
      setFolderId(editingCred.folderId || '')
    } else {
      setSite(''); setUser(''); setPass(''); setUrl('')
      setCategory('Other'); setNotes('')
      setFolderId(defaultFolderId || '')
    }
    setPassVisible(false)
  }, [editingCred, defaultFolderId])

  const handleSave = () => {
    onSave({
      site: site.trim(),
      user: user.trim(),
      pass,
      url: url.trim(),
      category,
      notes: notes.trim(),
      folderId: folderId || null,
    })
  }

  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div id="form-view">
      <div className="form-title">{editingCred ? 'Edit Credential' : 'Add Credential'}</div>
      <div className="form-card">
        <div className="form-group">
          <label className="form-lbl">Website / App Name *</label>
          <input className="form-inp" type="text" placeholder="e.g., Google"
            value={site} onChange={(e) => setSite(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-lbl">Category</label>
          <select className="form-inp" value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(CATEGORIES).map(([key, emoji]) => (
              <option key={key} value={key}>{emoji} {key}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-lbl">Folder</label>
          <select className="form-inp" value={folderId} onChange={(e) => setFolderId(e.target.value)}>
            <option value="">— No Folder —</option>
            {sortedFolders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-lbl">Username / Email</label>
          <input className="form-inp" type="text" placeholder="username@example.com"
            value={user} onChange={(e) => setUser(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-lbl">Password *</label>
          <div className="pass-wrap">
            <input className="form-inp" type={passVisible ? 'text' : 'password'}
              placeholder="Enter password" value={pass} onChange={(e) => setPass(e.target.value)} />
            <button className="pass-toggle" type="button" onClick={() => setPassVisible((v) => !v)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-lbl">URL (optional)</label>
          <input className="form-inp" type="text" placeholder="https://…"
            value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-lbl">Notes</label>
          <textarea className="form-inp" placeholder="Optional notes, recovery codes, hints…"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave}>Save</button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        {editingCred && (
          <button className="btn-danger" onClick={() => onDelete(editingCred.id)}>Delete</button>
        )}
      </div>
    </div>
  )
}
