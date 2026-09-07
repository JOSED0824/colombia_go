import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type SavedRoutesContextValue = {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

const SavedRoutesContext = createContext<SavedRoutesContextValue | null>(null)
const STORAGE_KEY = 'colombiago-saved-routes'

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function SavedRoutesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(readStored)

  const value = useMemo<SavedRoutesContextValue>(
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

  return <SavedRoutesContext.Provider value={value}>{children}</SavedRoutesContext.Provider>
}

export function useSavedRoutes() {
  const ctx = useContext(SavedRoutesContext)
  if (!ctx) throw new Error('SavedRoutesProvider missing')
  return ctx
}
