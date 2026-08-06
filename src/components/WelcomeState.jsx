export default function WelcomeState() {
  return (
    <div id="welcome-state">
      <svg className="empty-ico" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="30" width="56" height="38" rx="9" stroke="#1d1d1f" strokeWidth="4" />
        <path d="M22 30V22C22 13.163 28.163 7 36 7C43.837 7 50 13.163 50 22V30"
          stroke="#1d1d1f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="36" cy="50" r="5" fill="#1d1d1f" />
      </svg>
      <h3>Your vault is empty</h3>
      <p>Click <strong>Add Credential</strong> to securely store your first password.</p>
    </div>
  )
}
