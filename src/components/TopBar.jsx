import { useRef, useEffect } from 'react'

export default function TopBar({
  isUnlocked,
  searchQuery,
  onSearchChange,
  searchOpen,
  setSearchOpen,
  sidebarOpen,
  setSidebarOpen,
  onAddCredential,
  onShowIO,
  onShowSettings,
  onLock,
}) {
  const searchRef = useRef(null)

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  return (
    <header id="top-bar">
      {/* Left: Hamburger (mobile) */}
      <div className="top-bar-side top-bar-left">
        {isUnlocked && (
          <button
            className="top-bar-icon-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect y="4"    width="24" height="2.2" rx="1.1" />
              <rect y="10.9" width="24" height="2.2" rx="1.1" />
              <rect y="17.8" width="24" height="2.2" rx="1.1" />
            </svg>
          </button>
        )}
      </div>

      {/* Center: Logo + Title */}
      <div className="top-bar-center">
        <svg className="top-bar-logo" viewBox="0 0 30 30" fill="none">
          <rect width="30" height="30" rx="7" fill="#0a84ff" />
          <rect x="8.5" y="13.5" width="13" height="10.5" rx="2.5" fill="white" />
          <path
            d="M10.5 13.5V10C10.5 7.515 12.515 5.5 15 5.5C17.485 5.5 19.5 7.515 19.5 10V13.5"
            stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"
          />
          <circle cx="15" cy="18.5" r="1.5" fill="#0a84ff" />
        </svg>
        <span className="top-bar-title">KeyVault</span>
      </div>

      {/* Right: Search icon */}
      <div className="top-bar-side top-bar-right">
        {isUnlocked && (
          <button
            className={`top-bar-icon-btn${searchOpen ? ' active' : ''}`}
            onClick={() => {
              setSearchOpen((v) => {
                if (v) onSearchChange('')
                return !v
              })
            }}
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
          </button>
        )}
      </div>

      {/* Expandable search row */}
      {isUnlocked && searchOpen && (
        <div className="top-bar-search-row">
          <input
            ref={searchRef}
            className="top-bar-search-input"
            type="search"
            placeholder="Search credentials…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button
            className="top-bar-search-close"
            onClick={() => { setSearchOpen(false); onSearchChange('') }}
            aria-label="Close search"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  )
}
