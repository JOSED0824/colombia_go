type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onFilter?: () => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  onFilter,
  placeholder = '¿Qué quieres descubrir hoy?',
}: SearchBarProps) {
  return (
    <label className="search">
      <span className="search__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button type="button" className="search__filter" onClick={onFilter} aria-label="Filtros">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      </button>
    </label>
  )
}
