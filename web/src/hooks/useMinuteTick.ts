import { useEffect, useState } from 'react'

/** Re-render every minute so relative timestamps stay fresh. */
export function useMinuteTick() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])
}
