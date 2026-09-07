import type { ReactNode } from 'react'

export function ThemeIcons() {
  return (
    <section className="theme-icons" aria-label="Experiencias">
      <Icon label="Beach">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M32 38c0-10 8-16 8-24-8 4-12 14-8 24z" />
          <path d="M18 46c6-4 12-4 18 0s12 4 18 0" />
          <path d="M14 52c7-3 14-3 22 0s15 3 22 0" />
        </svg>
      </Icon>
      <Icon label="Coffee">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
          <ellipse cx="30" cy="34" rx="12" ry="16" />
          <path d="M42 28c6 0 8 6 4 10" />
          <path d="M26 22c2-6 8-8 10-2" />
        </svg>
      </Icon>
      <Icon label="Cable car">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M8 16h48" />
          <path d="M32 16v8" />
          <rect x="20" y="24" width="24" height="18" rx="3" />
          <path d="M20 34h24" />
        </svg>
      </Icon>
      <Icon label="Museum">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M10 26 32 12l22 14" />
          <path d="M16 26v22M32 26v22M48 26v22M12 48h40" />
        </svg>
      </Icon>
      <Icon label="Dance">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="24" cy="16" r="4" />
          <circle cx="40" cy="16" r="4" />
          <path d="M24 22c0 8 8 10 8 18M40 22c0 8-8 10-8 18" />
          <path d="M20 50l4-10 8 8 8-8 4 10" />
        </svg>
      </Icon>
      <Icon label="Food">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M14 36c0 12 36 12 36 0" />
          <path d="M18 36c2-10 26-10 28 0" />
          <path d="M28 18c0 6 8 6 8 0" />
        </svg>
      </Icon>
    </section>
  )
}

function Icon({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="theme-icon">
      {children}
      <span>{label}</span>
    </div>
  )
}
