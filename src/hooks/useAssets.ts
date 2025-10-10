import { useEffect, useState } from 'react'

interface AssetData {
  issuerIdentity: string
  name: string
  universeIndex: number
}

export function useAssets() {
  const [assets, setAssets] = useState<AssetData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAssets() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/assets.json')
        
        if (!response.ok) {
          throw new Error(`Failed to load assets: ${response.status}`)
        }
        
        const assetData = await response.json()
        setAssets(assetData)
      } catch (err) {
        console.error('Failed to load assets:', err)
        setError(err instanceof Error ? err.message : 'Failed to load assets')
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [])

  return { assets, loading, error }
}
