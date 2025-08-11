import { describe, expect, it, vi } from 'vitest'

import {
	GET_POLL_INFO_DECODED_RESPONSE_MOCK,
	GET_POLL_INFO_ENCODED_RESPONSE_MOCK
} from '../__mocks__/decoders.mocks'
import { QUTIL_ABI } from '../contracts'
import { decodeContractResponse } from '../decoders'
import type {
	GetCurrentPollIdResponse,
	GetPollInfoResponse,
	GetPollsByCreatorResponse
} from '../schemas'

describe('decoders', () => {
	describe('other decoders', () => {})

	describe('decodeContractResponse', () => {
		describe('getCurrentPollId', () => {
			it('decodes getCurrentPollId response correctly', async () => {
				const responseData =
					'AgAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAA'

				const result = await decodeContractResponse(
					responseData,
					QUTIL_ABI.functions.getCurrentPollId.outputs
				)
				const data = result.data as GetCurrentPollIdResponse

				expect(result.success).toBe(true)
				expect(result.data).toBeDefined()
				expect(result.byteLength).toBeGreaterThan(0)

				expect(Array.isArray(data.active_poll_ids)).toBe(true)
				expect(data.active_poll_ids).toHaveLength(64)
				expect(data.current_poll_id).toBe(2)
				expect(data.active_count).toBe(32768)
				expect(data.active_poll_ids[0]).toBe(0)
				expect(data.active_poll_ids[1]).toBe(1)
			})
		})

		describe('getPollsByCreator', () => {
			it('decodes getPollsByCreator response correctly', async () => {
				const responseData =
					'AAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAA=='

				const result = await decodeContractResponse(
					responseData,
					QUTIL_ABI.functions.getPollsByCreator.outputs
				)
				const data = result.data as GetPollsByCreatorResponse

				expect(result.success).toBe(true)
				expect(result.data).toBeDefined()
				expect(data.count).toBe(2)
				expect(Array.isArray(data.poll_ids)).toBe(true)
				expect(data.poll_ids).toHaveLength(64)
				expect(data.poll_ids[0]).toBe(0)
				expect(data.poll_ids[1]).toBe(1)
			})
		})

		describe('getPollInfo', () => {
			it('decodes getPollInfo response correctly', async () => {
				const result = await decodeContractResponse(
					GET_POLL_INFO_ENCODED_RESPONSE_MOCK,
					QUTIL_ABI.functions.getPollInfo.outputs
				)

				const data = result.data as GetPollInfoResponse

				expect(result.success).toBe(true)
				expect(data).toEqual(GET_POLL_INFO_DECODED_RESPONSE_MOCK)
			})
		})

		describe('Error handling', () => {
			it('handles invalid base64 data gracefully', async () => {
				// Mock console.error to avoid logging expected errors to the console causing confusions
				const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
				try {
					const result = await decodeContractResponse('invalid-base64-data!@#', [
						{ name: 'test', type: 'uint64' }
					])
					expect(result.success).toBe(false)
					expect(result.error).toBeDefined()
					expect(result.error).toContain(
						'Invalid character: the string to be decoded is not correctly encoded.'
					)
				} finally {
					spy.mockRestore()
				}
			})
		})
	})
})
