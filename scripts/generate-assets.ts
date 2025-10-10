import { writeFileSync } from 'fs'

const QUBIC_RPC_URL = import.meta.env.VITE_QUBIC_RPC_URL || 'https://rpc.qubic.org'
const ASSETS_ENDPOINT = `${QUBIC_RPC_URL}/v1/assets/issuances`

async function generateAssets() {
  try {
    console.log('🔄 Fetching assets from Qubic RPC...')
    console.log(`📍 Using endpoint: ${ASSETS_ENDPOINT}`)
    
    const response = await fetch(ASSETS_ENDPOINT)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform to simpler format
    const assets = data.assets.map((asset: any) => ({
      issuerIdentity: asset.data.issuerIdentity,
      name: asset.data.name,
      universeIndex: asset.universeIndex
    }))
    
    // Write to public folder (accessible via /assets.json)
    writeFileSync('public/assets.json', JSON.stringify(assets, null, 2))
    
    console.log(`✅ Generated assets.json with ${assets.length} assets`)
    console.log(`📅 Last updated: ${new Date().toISOString()}`)
    
  } catch (error) {
    console.error('❌ Failed to generate assets:', error)
    process.exit(1)
  }
}

generateAssets()
