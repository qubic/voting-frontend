import { writeFileSync } from 'fs'

const QUBIC_RPC_URL = import.meta.env.VITE_QUBIC_RPC_URL || 'https://rpc.qubic.org'

// Smart contract configuration (from your constants)
const QUTIL_CONFIG = {
  CONTRACT_INDEX: 16 // From your constants
}

const QUTIL_FUNCTIONS = {
  GET_CURRENT_POLL_ID: 5,
  GET_POLL_INFO: 6,
  GET_CURRENT_RESULT: 3
}

// Make smart contract call
async function querySmartContract(inputType: number, inputSize: number, requestData: string) {
  const response = await fetch(`${QUBIC_RPC_URL}/v1/querySmartContract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contractIndex: QUTIL_CONFIG.CONTRACT_INDEX,
      inputType,
      inputSize,
      requestData
    })
  })

  if (!response.ok) {
    throw new Error(`Smart contract query failed: ${response.status}`)
  }

  return await response.json()
}

// Get current poll ID and active polls
async function getCurrentPollId() {
  const result = await querySmartContract(
    QUTIL_FUNCTIONS.GET_CURRENT_POLL_ID,
    0,
    ''
  )

  // Parse the response data (you'll need to implement proper decoding)
  // For now, we'll assume the response structure matches your frontend expectations
  return {
    success: true,
    data: {
      current_poll_id: result.data?.current_poll_id || 0,
      active_poll_ids: result.data?.active_poll_ids || [],
      active_count: result.data?.active_count || 0
    }
  }
}

// Get poll info for a specific poll ID
async function getPollInfo(pollId: number) {
  // Encode poll_id parameter (you'll need to implement proper encoding)
  const params = { poll_id: pollId }
  const encodedParams = Buffer.from(JSON.stringify(params)).toString('hex')
  
  const result = await querySmartContract(
    QUTIL_FUNCTIONS.GET_POLL_INFO,
    encodedParams.length / 2, // hex string length / 2 = byte length
    encodedParams
  )

  return {
    success: true,
    data: {
      found: result.data?.found || 0,
      poll_info: result.data?.poll_info || {},
      poll_link: result.data?.poll_link || []
    }
  }
}

// Get current result for a specific poll ID
async function getCurrentResult(pollId: number) {
  // Encode poll_id parameter
  const params = { poll_id: pollId }
  const encodedParams = Buffer.from(JSON.stringify(params)).toString('hex')
  
  const result = await querySmartContract(
    QUTIL_FUNCTIONS.GET_CURRENT_RESULT,
    encodedParams.length / 2,
    encodedParams
  )

  return {
    success: true,
    data: {
      result: result.data?.result || [],
      voter_count: result.data?.voter_count || [],
      is_active: result.data?.is_active || 0
    }
  }
}

// Main function to fetch all polls data
async function generatePolls() {
  try {
    console.log('🔄 Fetching polls from Qubic smart contract...')
    console.log(`📍 Using endpoint: ${QUBIC_RPC_URL}`)
    
    // Get current poll overview
    const currentPollData = await getCurrentPollId()
    
    if (!currentPollData.success || !currentPollData.data) {
      throw new Error('Failed to get current poll data')
    }

    const { current_poll_id, active_poll_ids, active_count } = currentPollData.data
    
    console.log(`📊 Found ${active_count} active polls, current poll ID: ${current_poll_id}`)
    
    // Fetch details for all active polls
    const activePolls = []
    for (let i = 0; i < active_count; i++) {
      const pollId = active_poll_ids[i]
      console.log(`📋 Fetching poll ${pollId}...`)
      
      const pollInfo = await getPollInfo(pollId)
      const pollResult = await getCurrentResult(pollId)
      
      if (pollInfo.success && pollInfo.data.found === 1) {
        activePolls.push({
          id: pollId,
          ...pollInfo.data.poll_info,
          poll_link: pollInfo.data.poll_link,
          results: pollResult.success ? pollResult.data : null
        })
      }
    }
    
    // Create polls data structure
    const pollsData = {
      current_poll_id,
      active_poll_ids,
      active_count,
      active_polls: activePolls,
      lastUpdated: new Date().toISOString()
    }
    
    // Write to public folder (accessible via /polls.json)
    writeFileSync('public/polls.json', JSON.stringify(pollsData, null, 2))
    
    console.log(`✅ Generated polls.json with ${activePolls.length} active polls`)
    console.log(`📅 Last updated: ${new Date().toISOString()}`)
    
  } catch (error) {
    console.error('❌ Failed to generate polls:', error)
    process.exit(1)
  }
}

generatePolls()