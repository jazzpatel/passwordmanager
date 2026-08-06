import { useState } from 'react'
import { avatarColor } from '../utils/helpers.js'
import { loadSettings } from '../utils/helpers.js'

export default function Sidebar({
  credentials, folders, currentId, currentFolderId,
  searchQuery, collapsedFolders,
  view,
  sidebarOpen,
  onSearch, onSelectCredential, onSelectFolder,
  onAddCredential, onShowIO, onShowSettings, onLock,
  onToggleFolder, onCreateFolder, onRenameFolder, onDeleteFolder,
}) {
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renamingFolderId, setRenamingFolderId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const query = searchQuery.toLowerCase()
  const filtered = query
    ? credentials.filter(
        (c) =>
          c.site.toLowerCase().includes(query) ||
          (c.user || '').toLowerCase().includes(query) ||
          (c.category || '').toLowerCase().includes(query) ||
          (c.notes || '').toLowerCase().includes(query),
      )
    : credentials

  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name))

  const handleConfirmCreate = async () => {
    const name = newFolderName.trim()
    if (name) await onCreateFolder(name)
    setCreatingFolder(false)
    setNewFolderName('')
  }

  const handleStartRename = (folder) => {
    setRenamingFolderId(folder.id)
    setRenameValue(folder.name)
  }

  const handleConfirmRename = async (folderId) => {
    const n = renameValue.trim()
    if (n) await onRenameFolder(folderId, n)
    setRenamingFolderId(null)
    setRenameValue('')
  }

  const isAllActive = view !== 'folder' && view !== 'io' && view !== 'settings' && !currentFolderId

  return (
    <nav id="sidebar" className={sidebarOpen ? 'sidebar--open' : ''}>
      <div className="sb-header">
        <svg className="sb-logo" viewBox="0 0 30 30" fill="none">
          <rect width="30" height="30" rx="7" fill="#0a84ff" />
          <rect x="8.5" y="13.5" width="13" height="10.5" rx="2.5" fill="white" />
          <path d="M10.5 13.5V10C10.5 7.515 12.515 5.5 15 5.5C17.485 5.5 19.5 7.515 19.5 10V13.5"
            stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="15" cy="18.5" r="1.5" fill="#0a84ff" />
        </svg>
        <span className="sb-title">KeyVault 1.0</span>
      </div>

      <div className="sb-search">
        <input
          type="text"
          id="search-input"
          placeholder="Search credentials…"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div id="categories-nav">
        {/* All Items row */}
        <div
          className={`nav-all${isAllActive ? ' active' : ''}`}
          onClick={() => {
            if (filtered.length) onSelectCredential(filtered[0].id)
            else onAddCredential()
          }}
        >
          <span>🔐</span>
          <span style={{ flex: 1 }}>All Items</span>
          <span className="nav-all-count">{filtered.length}</span>
        </div>

        {/* Folders section header */}
        <div className="nav-section-hdr">
          <span className="nav-section-lbl">Folders</span>
          <button
            className="nav-add-folder-btn"
            title="New folder"
            onClick={() => { setCreatingFolder(true); setNewFolderName('') }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Inline folder create input */}
        {creatingFolder && (
          <div className="nav-folder-create-row">
            <input
              className="nav-folder-inp"
              placeholder="Folder name…"
              maxLength={40}
              value={newFolderName}
              autoFocus
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreate()
                if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName('') }
              }}
            />
            <button className="nav-folder-inp-ok" onClick={handleConfirmCreate} title="Create">✓</button>
            <button className="nav-folder-inp-cancel" onClick={() => { setCreatingFolder(false); setNewFolderName('') }} title="Cancel">✗</button>
          </div>
        )}

        {/* Named folders */}
        {sortedFolders.map((folder) => {
          const folderCreds = filtered.filter((c) => c.folderId === folder.id)
          const collapsed = collapsedFolders.has(folder.id)
          const isActive = currentFolderId === folder.id
          return (
            <div key={folder.id} className={`nav-folder${collapsed ? ' collapsed' : ''}`} data-id={folder.id}>
              <div className={`nav-folder-hdr${isActive ? ' active' : ''}`}>
                <svg
                  className="nav-folder-chevron"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  onClick={(e) => { e.stopPropagation(); onToggleFolder(folder.id) }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <svg className="nav-folder-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>

                {renamingFolderId === folder.id ? (
                  <input
                    className="nav-folder-inp"
                    style={{ flex: 1 }}
                    value={renameValue}
                    maxLength={40}
                    autoFocus
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleConfirmRename(folder.id) }
                      if (e.key === 'Escape') { setRenamingFolderId(null) }
                    }}
                    onBlur={() => setTimeout(() => handleConfirmRename(folder.id), 150)}
                  />
                ) : (
                  <span className="nav-folder-name" onClick={() => onSelectFolder(folder.id)}>
                    {folder.name}
                  </span>
                )}

                <span className="nav-folder-count">{folderCreds.length}</span>
                <div className="nav-folder-acts">
                  <button
                    className="nav-folder-act"
                    title="Rename"
                    onClick={(e) => { e.stopPropagation(); handleStartRename(folder) }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="nav-folder-act danger"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id) }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="nav-folder-items">
                {folderCreds.map((cred) => (
                  <CredItem key={cred.id} cred={cred} active={cred.id === currentId} onClick={() => onSelectCredential(cred.id)} />
                ))}
              </div>
            </div>
          )
        })}

        {/* Unfiled section */}
        {(() => {
          const unfiled = filtered.filter((c) => !c.folderId)
          if (unfiled.length === 0 && folders.length > 0) return null
          const collapsed = collapsedFolders.has('__unfiled__')
          return (
            <div className={`nav-folder${collapsed ? ' collapsed' : ''}`} data-id="__unfiled__">
              <div className="nav-folder-hdr">
                <svg
                  className="nav-folder-chevron"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  onClick={(e) => { e.stopPropagation(); onToggleFolder('__unfiled__') }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <svg className="nav-folder-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span className="nav-folder-name" style={{ color: 'var(--text-2)' }}>No Folder</span>
                <span className="nav-folder-count">{unfiled.length}</span>
                <div className="nav-folder-acts" />
              </div>
              <div className="nav-folder-items">
                {unfiled.map((cred) => (
                  <CredItem key={cred.id} cred={cred} active={cred.id === currentId} onClick={() => onSelectCredential(cred.id)} />
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      <div className="sb-footer">
        <button className="sb-btn sb-btn-add" onClick={() => onAddCredential()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Credential
        </button>
        <button className="sb-btn sb-btn-io" onClick={onShowIO}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8 17 12 21 16 17" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
          </svg>
          Import / Export
        </button>
        <button className="sb-btn sb-btn-settings" onClick={onShowSettings}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </button>
        <button className="sb-btn sb-btn-lock" onClick={onLock}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Lock Vault
        </button>
      </div>
    </nav>
  )
}

function CredItem({ cred, active, onClick }) {
  return (
    <div className={`nav-cred${active ? ' active' : ''}`} data-id={cred.id} onClick={onClick}>
      <div className="nav-cred-av" style={{ background: avatarColor(cred.site) }}>
        {cred.site.charAt(0).toUpperCase()}
      </div>
      <div className="nav-cred-text">
        <div className="nav-cred-name">{cred.site}</div>
        <div className="nav-cred-user">{cred.user || ''}</div>
      </div>
    </div>
  )
}
