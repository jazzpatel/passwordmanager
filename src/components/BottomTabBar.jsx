export default function BottomTabBar({
  isUnlocked,
  view,
  currentId,
  onHome,
  onToggleSearch,
  onAddCredential,
  onToggleSidebar,
  searchOpen,
}) {
  if (!isUnlocked) return null

  return (
    <nav id="bottom-tab-bar">
      {/* Home */}
      <button
        className={`btb-tab${view === 'detail' || view === 'welcome' ? ' btb-tab--active' : ''}`}
        onClick={onHome}
        aria-label="Home"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
        <span className="btb-label">Home</span>
      </button>

      {/* Search */}
      <button
        className={`btb-tab${searchOpen ? ' btb-tab--active' : ''}`}
        onClick={onToggleSearch}
        aria-label="Search"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="22" y2="22" />
        </svg>
        <span className="btb-label">Search</span>
      </button>

      {/* Add (primary CTA) */}
      <button
        className="btb-tab btb-tab--primary"
        onClick={onAddCredential}
        aria-label="Add credential"
      >
        <span className="btb-primary-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>

      {/* Folders */}
      <button
        className={`btb-tab${view === 'folder' ? ' btb-tab--active' : ''}`}
        onClick={() => onToggleSidebar('folders')}
        aria-label="Folders"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <span className="btb-label">Folders</span>
      </button>

      {/* Menu */}
      <button
        className="btb-tab"
        onClick={() => onToggleSidebar('menu')}
        aria-label="Menu"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
          <rect y="4"    width="24" height="2" rx="1" />
          <rect y="11"   width="24" height="2" rx="1" />
          <rect y="18"   width="24" height="2" rx="1" />
        </svg>
        <span className="btb-label">Menu</span>
      </button>
    </nav>
  )
}
