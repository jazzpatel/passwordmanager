import { useState } from 'react'
import { avatarColor, fmtDate } from '../utils/helpers.js'
import { CATEGORIES } from '../constants/index.js'

export default function DetailView({ cred, folder, onEdit, onDelete, onFolderClick }) {
  const [passShown, setPassShown] = useState(false)

  if (!cred) return null

  const href = cred.url
    ? cred.url.startsWith('http') ? cred.url : 'https://' + cred.url
    : null

  const copyText = (text) => navigator.clipboard.writeText(text).then(() => {})

  return (
    <div id="detail-view">
      <div className="dtl-header">
        <div className="dtl-av" style={{ background: avatarColor(cred.site) }}>
          {cred.site.charAt(0).toUpperCase()}
        </div>
        <div className="dtl-title-grp">
          <div className="dtl-title">{cred.site}</div>
          <div className="dtl-cat">
            {CATEGORIES[cred.category] || '📝'} {cred.category || 'Other'}
          </div>
          {folder && (
            <div
              id="dtl-folder-badge"
              style={{ display: 'inline-flex' }}
              onClick={() => onFolderClick(cred.folderId)}
            >
              📂 {folder.name}
            </div>
          )}
        </div>
        <div className="dtl-actions">
          <button className="btn-icon" onClick={onEdit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button className="btn-icon danger" onClick={() => onDelete(cred.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="dtl-card">
        <div className="dtl-row">
          <span className="dtl-lbl">Website</span>
          <span className="dtl-val">{cred.site}</span>
          <div className="dtl-row-btns">
            <button className="smol-btn" onClick={() => copyText(cred.site)}>Copy</button>
          </div>
        </div>
        <div className="dtl-row">
          <span className="dtl-lbl">Username</span>
          <span className="dtl-val">{cred.user || '—'}</span>
          <div className="dtl-row-btns">
            <button className="smol-btn" onClick={() => copyText(cred.user || '')}>Copy</button>
          </div>
        </div>
        <div className="dtl-row">
          <span className="dtl-lbl">Password</span>
          <span className="dtl-val mono">{passShown ? cred.pass : '••••••••••••'}</span>
          <div className="dtl-row-btns">
            <button className="smol-btn ghost" onClick={() => setPassShown((v) => !v)}>
              {passShown ? 'Hide' : 'Show'}
            </button>
            <button className="smol-btn" onClick={() => copyText(cred.pass)}>Copy</button>
          </div>
        </div>
        {cred.url && (
          <div className="dtl-row">
            <span className="dtl-lbl">URL</span>
            <span className="dtl-val">
              <a href={href} target="_blank" rel="noopener noreferrer">{cred.url}</a>
            </span>
            <div className="dtl-row-btns">
              <button className="smol-btn" onClick={() => copyText(cred.url)}>Copy</button>
            </div>
          </div>
        )}
      </div>

      {cred.notes && (
        <div className="dtl-notes-card">
          <div className="dtl-notes-lbl">Notes</div>
          <div className="dtl-notes-txt">{cred.notes}</div>
        </div>
      )}

      <div className="dtl-meta">
        <span>📅 Created: {fmtDate(cred.createdAt)}</span>
        <span>✏️ Updated: {fmtDate(cred.updatedAt)}</span>
      </div>
    </div>
  )
}
