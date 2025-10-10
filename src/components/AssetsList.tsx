import { useEffect, useState } from 'react'

interface AssetData {
  issuerIdentity: string
  name: string
  universeIndex: number
}

export function AssetsList() {
  const [assets, setAssets] = useState<AssetData[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    async function loadAssets() {
      try {
        const response = await fetch('/assets.json')
        if (response.ok) {
          const assetData = await response.json()
          setAssets(assetData)
        }
      } catch (error) {
        console.error('Failed to load assets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [])

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading available assets...
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-primary hover:underline"
      >
        {isExpanded ? 'Hide' : 'Show'} available assets ({assets.length})
      </button>
      
      {isExpanded && (
        <div className="max-h-60 overflow-y-auto rounded-md border bg-muted/30 p-3">
          <div className="space-y-2">
            {assets.map((asset) => (
              <div key={asset.issuerIdentity} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-muted-foreground">
                    ({asset.issuerIdentity.slice(0, 8)}...)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(asset.issuerIdentity)
                  }}
                  className="text-primary hover:underline"
                >
                  Copy issuer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
