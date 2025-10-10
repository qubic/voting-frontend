import dotenv from "dotenv"
dotenv.config()

import { exec } from 'child_process'
import express from 'express'
import { promisify } from 'util'

const execAsync = promisify(exec)
const app = express()
app.use(express.json())

// Security: API key from environment
const API_KEY = process.env.API_KEY || 'your-secret-api-key-here'

// Simple API key middleware
function requireApiKey(req, res, next) {
  const providedKey = req.headers['x-api-key']
  
  if (!providedKey || providedKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' })
  }
  
  next()
}

// Protected endpoint to update polls
app.post('/api/update-polls', requireApiKey, async (req, res) => {
  try {
    console.log('🔄 Updating polls...')
    await execAsync('/root/.bun/bin/bun run scripts/generate-polls.ts')
    
    res.json({ 
      success: true, 
      message: 'Polls updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to update polls:', error)
    res.status(500).json({ error: 'Failed to update polls' })
  }
})

// Protected endpoint to update assets
app.post('/api/update-assets', requireApiKey, async (req, res) => {
  try {
    console.log('🔄 Updating assets...')
    await execAsync('/root/.bun/bin/bun run scripts/generate-assets.ts')
    
    res.json({ 
      success: true, 
      message: 'Assets updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to update assets:', error)
    res.status(500).json({ error: 'Failed to update assets' })
  }
})

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    endpoints: ['/api/update-polls', '/api/update-assets']
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🔒 Secure API server running on port ${PORT}`)
  console.log(`🔑 API Key: ${API_KEY}`)
  console.log(`📡 Endpoints:`)
  console.log(`   POST /api/update-polls`)
  console.log(`   POST /api/update-assets`)
  console.log(`   GET  /api/health`)
})
