import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type FavoritesContextValue = {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)
const STORAGE_KEY = 'colombiago-favorites'

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(readStored)

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ids,
      has: (id) => ids.includes(id),
      toggle: (id) => {
        setIds((current) => {
          const next = current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id]
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          return next
        })
      },
    }),
    [ids],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('FavoritesProvider missing')
  return ctx
}
