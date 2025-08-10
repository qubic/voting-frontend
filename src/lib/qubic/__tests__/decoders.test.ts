import { describe, expect, it } from 'vitest'

import { QUTIL_ABI } from '../contracts'
import { decodeContractResponse } from '../decoders'

describe('decodeContractResponse', () => {
	describe('getCurrentPollId', () => {
		it('decodes getCurrentPollId response correctly', () => {
			const responseData =
				'AgAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAA'

			const result = decodeContractResponse(responseData, QUTIL_ABI.getCurrentPollId.outputs)
			const data = result.data as {
				current_poll_id: string
				active_count: string
				active_poll_ids: string[]
			}

			expect(result.success).toBe(true)
			expect(result.data).toBeDefined()
			expect(result.byteLength).toBeGreaterThan(0)

			expect(Array.isArray(data.active_poll_ids)).toBe(true)
			expect(data.active_poll_ids).toHaveLength(64)
			expect(data.current_poll_id).toBe('2')
			expect(data.active_count).toBe('32768')
			expect(data.active_poll_ids[0]).toBe('0')
			expect(data.active_poll_ids[1]).toBe('1')
		})
	})

	describe('getPollsByCreator', () => {
		it('decodes getPollsByCreator response correctly', () => {
			const responseData =
				'AAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAA=='

			const result = decodeContractResponse(responseData, QUTIL_ABI.getPollsByCreator.outputs)
			const data = result.data as {
				poll_ids: string[]
				count: string
			}

			expect(result.success).toBe(true)
			expect(result.data).toBeDefined()
			expect(data.count).toBe('2')
			expect(Array.isArray(data.poll_ids)).toBe(true)
			expect(data.poll_ids).toHaveLength(64)
			expect(data.poll_ids[0]).toBe('0')
			expect(data.poll_ids[1]).toBe('1')
		})
	})

	describe('Error handling', () => {
		it('handles invalid base64 data gracefully', () => {
			const result = decodeContractResponse('invalid-base64-data!@#', [
				{ name: 'test', type: 'uint64' }
			])

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
		})

		it('handles unsupported types gracefully', () => {
			const testData = Buffer.alloc(4)
			const base64Data = Buffer.from(testData).toString('base64')

			const result = decodeContractResponse(base64Data, [
				{ name: 'unsupported', type: 'unsupported_type' }
			])

			expect(result.success).toBe(true)
			expect(result.data).toBeDefined()

			const data = result.data as {
				unsupported: string
			}
			expect(data.unsupported).toContain('[Unsupported Type: unsupported_type]')
		})
	})
})
