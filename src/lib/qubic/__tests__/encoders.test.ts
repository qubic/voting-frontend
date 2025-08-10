import { describe, expect, it } from 'vitest'

import { QUTIL_ABI } from '../contracts'
import { encodeParams } from '../encoders'

describe('encodeParams', () => {
	describe('getCurrentPollId', () => {
		it('encodes empty parameters correctly', () => {
			const result = encodeParams({}, QUTIL_ABI.getCurrentPollId.inputs)

			expect(result.encodedParams).toBe('')
			expect(result.inputSize).toBe(0)
		})
	})

	describe('getPollsByCreator', () => {
		it('encodes creator address parameter correctly', () => {
			const params = {
				creator: 'IPRVRRNTUTWURASNKZTIZDYSVYJAHFKIGRLRLIDEHHIUCTAAJLFASDQGAXWN'
			}

			const result = encodeParams(params, QUTIL_ABI.getPollsByCreator.inputs)

			expect(result.encodedParams).toBeDefined()
			expect(result.encodedParams.length).toBeGreaterThan(0)
			expect(result.inputSize).toBe(32) // ID type is 32 bytes
		})
	})

	describe('getPollInfo', () => {
		it('encodes poll_id parameter correctly', () => {
			const params = { poll_id: 123 }

			const result = encodeParams(params, QUTIL_ABI.getPollInfo.inputs)

			expect(result.encodedParams).toBeDefined()
			expect(result.encodedParams.length).toBeGreaterThan(0)
			expect(result.inputSize).toBe(8) // uint64 is 8 bytes
		})
	})

	describe('getTotalNumberOfAssetShares', () => {
		it('encodes asset parameter correctly', () => {
			const params = {
				asset: {
					issuer: 'IPRVRRNTUTWURASNKZTIZDYSVYJAHFKIGRLRLIDEHHIUCTAAJLFASDQGAXWN',
					assetName: '123456789'
				}
			}

			const result = encodeParams(params, QUTIL_ABI.getTotalNumberOfAssetShares.inputs)

			expect(result.encodedParams).toBeDefined()
			expect(result.encodedParams.length).toBeGreaterThan(0)
			expect(result.inputSize).toBe(40) // ID (32) + uint64 (8) = 40 bytes
		})
	})

	describe('createPoll', () => {
		it('encodes complex poll creation parameters correctly', () => {
			const params = {
				poll_name: 'TestPoll',
				poll_type: 1,
				min_amount: 1000,
				github_link: 'https://github.com/test/poll',
				allowed_assets: [
					{
						issuer: 'IPRVRRNTUTWURASNKZTIZDYSVYJAHFKIGRLRLIDEHHIUCTAAJLFASDQGAXWN',
						assetName: '123456789'
					}
				],
				num_assets: 1
			}

			const result = encodeParams(params, QUTIL_ABI.createPoll.inputs)

			expect(result.encodedParams).toBeDefined()
			expect(result.encodedParams.length).toBeGreaterThan(0)
			// poll_name (32) + poll_type (8) + min_amount (8) + github_link (256) + allowed_assets (16 * 40) + num_assets (8)
			expect(result.inputSize).toBe(32 + 8 + 8 + 256 + 16 * 40 + 8)
		})
	})
})
