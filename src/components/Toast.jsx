import { useRef } from 'react'

export default function Toast({ msg, visible }) {
  // Track whether the toast has ever been triggered so it
  // stays hidden on the very first render (msg = '', visible = false).
  const hasShownRef = useRef(false)
  if (visible) hasShownRef.current = true

  if (!hasShownRef.current) return null

  return (
    <div id="toast" className={visible ? 'show' : ''}>
      {msg}
    </div>
  )
}
