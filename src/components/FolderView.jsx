import { useState } from 'react'
import { avatarColor } from '../utils/helpers.js'
import { CATEGORIES, CAT_ORDER } from '../constants/index.js'

export default function FolderView({ folder, credentials, onAddCredential, onDeleteFolder, onSelectCredential, onRenameFolder }) {
  const [renaming, setRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState('')

  if (!folder) return null

  const folderCreds = credentials.filter((c) => c.folderId === folder.id)

  // Group by category
  const groups = {}
  for (const cred of folderCreds) {
    const cat = cred.category || 'Other'
    ;(groups[cat] = groups[cat] || []).push(cred)
  }
  const sortedCats = Object.keys(groups).sort((a, b) => {
    const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b)
    if (ia < 0 && ib < 0) return a.localeCompare(b)
    if (ia < 0) return 1
    if (ib < 0) return -1
    return ia - ib
  })

  const startRename = () => { setRenameVal(folder.name); setRenaming(true) }
  const commitRename = async () => {
    const n = renameVal.trim()
    if (n && n !== folder.name) await onRenameFolder(folder.id, n)
    setRenaming(false)
  }

  return (
    <div id="folder-view">
      <div className="fv-header">
        <div className="fv-av">📂</div>
        <div className="fv-title-grp">
          {renaming ? (
            <input
              className="fv-title-inp"
              value={renameVal}
              maxLength={40}
              autoFocus
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitRename() }
                if (e.key === 'Escape') setRenaming(false)
              }}
              onBlur={() => setTimeout(commitRename, 150)}
            />
          ) : (
            <div className="fv-title" onClick={startRename}>
              {folder.name}
              <span className="fv-edit-hint">✏️</span>
            </div>
          )}
          <div className="fv-subtitle">
            {folderCreds.length} credential{folderCreds.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="fv-actions">
          <button className="btn-icon" onClick={() => onAddCredential(folder.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Credential
          </button>
          <button className="btn-icon danger" onClick={() => onDeleteFolder(folder.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            Delete Folder
          </button>
        </div>
      </div>

      <div id="fv-list">
        {folderCreds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
            <p style={{ marginBottom: 16, fontSize: 14 }}>No credentials in this folder yet.</p>
            <button className="btn-primary" onClick={() => onAddCredential(folder.id)}>Add Credential</button>
          </div>
        ) : (
          sortedCats.map((cat) => (
            <div key={cat} className="fv-category">
              <div className="fv-cat-lbl">{CATEGORIES[cat] || '📝'} {cat}</div>
              <div className="fv-grid">
                {groups[cat].map((cred) => (
                  <div key={cred.id} className="fv-card" onClick={() => onSelectCredential(cred.id)}>
                    <div className="fv-card-av" style={{ background: avatarColor(cred.site) }}>
                      {cred.site.charAt(0).toUpperCase()}
                    </div>
                    <div className="fv-card-body">
                      <div className="fv-card-name">{cred.site}</div>
                      <div className="fv-card-user">{cred.user || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
