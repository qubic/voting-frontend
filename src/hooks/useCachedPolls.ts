import { useEffect, useState } from 'react'

interface PollData {
  id: number
  poll_name: string
  poll_type: number
  min_amount: number
  github_link: string
  creator: string
  is_active: number
  poll_link: number[]
  results?: {
    result: number[]
    voter_count: number[]
    is_active: number
  }
}

interface PollsCache {
  current_poll_id: number
  active_poll_ids: number[]
  active_count: number
  active_polls: PollData[]
  lastUpdated: string
}

export function useCachedPolls() {
  const [polls, setPolls] = useState<PollData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    async function loadPolls() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/polls.json')
        
        if (!response.ok) {
          throw new Error(`Failed to load polls: ${response.status}`)
        }
        
        const pollsData: PollsCache = await response.json()
        setPolls(pollsData.active_polls || [])
        setLastUpdated(pollsData.lastUpdated)
      } catch (err) {
        console.error('Failed to load cached polls:', err)
        setError(err instanceof Error ? err.message : 'Failed to load polls')
      } finally {
        setLoading(false)
      }
    }

    loadPolls()
  }, [])

  return { 
    polls, 
    loading, 
    error, 
    lastUpdated,
    refresh: () => window.location.reload() // Simple refresh
  }
}
