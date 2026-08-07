import { useRef } from 'react'

export default function Toast({ msg, visible }) {
  // Suppress rendering until the toast has been triggered at least once,
  // so it doesn't flash on initial app load.
  const hasShownRef = useRef(false)
  if (visible) hasShownRef.current = true
  if (!hasShownRef.current) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'calc(72px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(14px)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        background: '#313244',
        color: '#cdd6f4',
        padding: '10px 20px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        zIndex: 9999,
        whiteSpace: 'nowrap',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        userSelect: 'none',
      }}
    >
      {msg}
    </div>
  )
}
