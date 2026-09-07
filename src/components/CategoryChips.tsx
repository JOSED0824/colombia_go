import { CATEGORIES, type Category } from '../data/destinations'

type Props = {
  active: Category
  onChange: (category: Category) => void
}

export function CategoryChips({ active, onChange }: Props) {
  return (
    <div className="chips" role="tablist" aria-label="Categorías">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          role="tab"
          aria-selected={active === cat.id}
          className={`chip ${active === cat.id ? 'chip--active' : ''}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
