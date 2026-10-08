export function AvatarCine() {
  return (
    <span className="avatar" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="32" fill="#241c14" />
        <circle cx="32" cy="32" r="16" fill="none" stroke="#e2a23a" strokeWidth="3" />
        <circle cx="32" cy="32" r="4.5" fill="#e2a23a" />
        <circle cx="32" cy="12" r="3.2" fill="#f3eadf" />
        <circle cx="32" cy="52" r="3.2" fill="#f3eadf" />
        <circle cx="12" cy="32" r="3.2" fill="#f3eadf" />
        <circle cx="52" cy="32" r="3.2" fill="#f3eadf" />
        <path d="M32 16.5v8.5M32 39v8.5M16.5 32H25M39 32h8.5" stroke="#c6a15b" strokeWidth="1.4" />
      </svg>
    </span>
  )
}
