import { useEffect, useState } from 'react'
import type { Destination } from '../data/destinations'
import { apiGet } from './api'
import { toDestinationDetail } from './mappers'
import type { LugarDetalleDto } from './types'

/** Fetches destination details for a list of ids (e.g. favorites/saved-routes ids from localStorage). */
export function useDestinationsByIds(ids: string[]) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const key = ids.join(',')

  useEffect(() => {
    if (ids.length === 0) {
      setDestinations([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all(
      ids.map((id) =>
        apiGet<LugarDetalleDto>(`/api/v1/lugares/${id}`)
          .then(toDestinationDetail)
          .catch(() => null),
      ),
    )
      .then((results) => setDestinations(results.filter((d): d is Destination => d !== null)))
      .finally(() => setLoading(false))
  }, [key])

  return { destinations, loading }
}
