import base64 from 'base-64'
import { Buffer } from 'buffer'
import { describe, expect, it } from 'vitest'

import {
	CREATE_POLL_INPUT_ENCODED_PARAMS_EXPECTED,
	CREATE_POLL_INPUT_PARAMS_MOCK
} from '../__mocks__/encoders.mocks'
import { NULL_ID, QUTIL_CONFIG } from '../constants'
import { QUTIL_ABI } from '../contracts'
import type { QUtilInputOutput } from '../contracts/qutil.abi'
import { assetNameToUint64 } from '../converters'
import { encodeParams } from '../encoders'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const b64ToBuf = (b64: string) => Buffer.from(base64.decode(b64), 'binary')
const zeros = (n: number) => Buffer.alloc(n, 0)

const readU64LE = (buf: Buffer, offset: number) => buf.readBigUInt64LE(offset)
const readI64LE = (buf: Buffer, offset: number) => buf.readBigInt64LE(offset)
const readU32LE = (buf: Buffer, offset: number) => buf.readUInt32LE(offset)
const readI32LE = (buf: Buffer, offset: number) => buf.readInt32LE(offset)
const readU16LE = (buf: Buffer, offset: number) => buf.readUInt16LE(offset)
const readI16LE = (buf: Buffer, offset: number) => buf.readInt16LE(offset)

// deterministic 32 raw bytes (1..32)
const RAW32 = Buffer.from(Array.from({ length: 32 }, (_, i) => (i + 1) & 0xff))
const ASSET_NAME_MOCK = 'GARTH'
const RAW32_HEX = RAW32.toString('hex')
const ASSET_STRUCT_MOCK = {
	issuer: RAW32_HEX, // use deterministic 32B hex, not Base32
	assetName: ASSET_NAME_MOCK // "GARTH" → normalized to uint64 by encoder
}

// ---------------------------------------------------------------------------
// encoders.ts
// ---------------------------------------------------------------------------
describe('encoders.ts', () => {
	// -------------------------------------------------------------------------
	// encodeParams
	// -------------------------------------------------------------------------
	describe('encodeParams', () => {
		// -----------------------------------------------------------------------
		// primitives
		// -----------------------------------------------------------------------
		describe('primitives', () => {
			it('encodes unsigned integers (LE) correctly', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [
					{ name: 'u8', type: 'uint8' },
					{ name: 'u16', type: 'uint16' },
					{ name: 'u32', type: 'uint32' },
					{ name: 'u64', type: 'uint64' }
				]
				const params = { u8: 0x7a, u16: 0x1234, u32: 0x89abcdef, u64: 123456789n }

				// Act
				const { encodedParams, inputSize } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(inputSize).toBe(1 + 2 + 4 + 8)
				expect(buf[0]).toBe(0x7a)
				expect(readU16LE(buf, 1)).toBe(0x1234)
				expect(readU32LE(buf, 3)).toBe(0x89abcdef)
				expect(readU64LE(buf, 7)).toBe(123456789n)
			})

			it('encodes signed integers (LE) correctly', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [
					{ name: 'i8', type: 'int8' },
					{ name: 's8', type: 'sint8' },
					{ name: 'i16', type: 'int16' },
					{ name: 's16', type: 'sint16' },
					{ name: 'i32', type: 'int32' },
					{ name: 's32', type: 'sint32' },
					{ name: 'i64', type: 'int64' },
					{ name: 's64', type: 'sint64' }
				]
				const params = {
					i8: -1,
					s8: -2,
					i16: -3,
					s16: -4,
					i32: -5,
					s32: -6,
					i64: -7n,
					s64: -8n
				}

				// Act
				const { encodedParams, inputSize } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(inputSize).toBe(1 + 1 + 2 + 2 + 4 + 4 + 8 + 8)
				expect(buf.readInt8(0)).toBe(-1)
				expect(buf.readInt8(1)).toBe(-2)
				expect(readI16LE(buf, 2)).toBe(-3)
				expect(readI16LE(buf, 4)).toBe(-4)
				expect(readI32LE(buf, 6)).toBe(-5)
				expect(readI32LE(buf, 10)).toBe(-6)
				expect(readI64LE(buf, 14)).toBe(-7n)
				expect(readI64LE(buf, 22)).toBe(-8n)
			})

			it('encodes bool/bit correctly', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [
					{ name: 'b1', type: 'bool' },
					{ name: 'b2', type: 'bit' },
					{ name: 'b3', type: 'bool' },
					{ name: 'b4', type: 'bit' }
				]
				const params = { b1: true, b2: false, b3: 1, b4: 0 }

				// Act
				const { encodedParams, inputSize } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(inputSize).toBe(4)
				expect([...buf]).toEqual([1, 0, 1, 0])
			})

			it('encodes char[256] (zero-padded UTF-8)', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [{ name: 'c', type: 'char[256]' }]
				const params = { c: 'abc' }

				// Act
				const { encodedParams, inputSize } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(inputSize).toBe(256)
				expect(buf.subarray(0, 3).toString('utf-8')).toBe('abc')
				expect(buf.subarray(3).equals(zeros(253))).toBe(true)
			})
		})

		// -----------------------------------------------------------------------
		// id semantics
		// -----------------------------------------------------------------------
		describe('id semantics', () => {
			it('encodes id with semantic:text as fixed 32B UTF-8 (truncated)', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [{ name: 'name', type: 'id', semantic: 'text' }]
				const long = 'X'.repeat(40)
				const params = { name: long }

				// Act
				const { encodedParams, inputSize } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(inputSize).toBe(32)
				expect(buf.subarray(0, 32).equals(Buffer.from('X'.repeat(32), 'utf-8'))).toBe(true)
			})

			it('encodes id with semantic:address from 64-char hex', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [
					{ name: 'addr', type: 'id', semantic: 'address' }
				]
				const params = { addr: RAW32_HEX }

				// Act
				const { encodedParams } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(buf.equals(RAW32)).toBe(true)
			})

			it('encodes id with semantic:address from raw Uint8Array(32)', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [
					{ name: 'addr', type: 'id', semantic: 'address' }
				]
				const params = { addr: new Uint8Array(RAW32) }

				// Act
				const { encodedParams } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(buf.equals(RAW32)).toBe(true)
			})

			it('encodes id with semantic:address as NULL_ID → zeros', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [
					{ name: 'addr', type: 'id', semantic: 'address' }
				]
				const params = { addr: NULL_ID }

				// Act
				const { encodedParams } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(buf.equals(zeros(32))).toBe(true)
			})

			it('encodes id with semantic:address invalid string → zeros', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [
					{ name: 'addr', type: 'id', semantic: 'address' }
				]
				const params = { addr: 'not-an-id' }

				// Act
				const { encodedParams } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(buf.equals(zeros(32))).toBe(true)
			})
		})

		// -----------------------------------------------------------------------
		// arrays
		// -----------------------------------------------------------------------
		describe('arrays', () => {
			it('encodes uint8[256] from string and number[] (truncation + padding)', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [
					{ name: 's', type: 'uint8[256]' },
					{ name: 'a', type: 'uint8[256]' }
				]
				const longStr = 'x'.repeat(300)
				const arr = [1, 2, 3]
				const params = { s: longStr, a: arr }

				// Act
				const { encodedParams, inputSize } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(inputSize).toBe(512)
				// string half
				expect(buf.subarray(0, 256).length).toBe(256)
				expect(buf[0]).toBe('x'.charCodeAt(0))
				expect(buf[255]).toBe('x'.charCodeAt(0))
				// array half
				const arrSlice = buf.subarray(256, 512)
				expect([...arrSlice.subarray(0, 3)]).toEqual([1, 2, 3])
				expect(arrSlice.subarray(3).equals(zeros(253))).toBe(true)
			})

			it('encodes uint64[64] with missing items zero-filled (LE)', () => {
				// Arrange
				const fields: QUtilInputOutput[] = [{ name: 'u', type: 'uint64[64]' }]
				const params = { u: [1, 2] }

				// Act
				const { encodedParams, inputSize } = encodeParams(params, fields)
				const buf = b64ToBuf(encodedParams)

				// Assert
				expect(inputSize).toBe(512)
				expect(readU64LE(buf, 0)).toBe(1n)
				expect(readU64LE(buf, 8)).toBe(2n)
				expect(readU64LE(buf, 16)).toBe(0n)
				expect(readU64LE(buf, 24)).toBe(0n)
			})
		})

		// -----------------------------------------------------------------------
		// structs
		// -----------------------------------------------------------------------
		describe('structs', () => {
			describe('Asset', () => {
				it('normalizes assetName symbol → uint64 and writes issuer(32)+name(8)', () => {
					// Arrange
					const fields: QUtilInputOutput[] = [{ name: 'asset', type: 'Asset' }]
					const params = { asset: ASSET_STRUCT_MOCK }

					// Act
					const { encodedParams, inputSize } = encodeParams(params, fields)
					const buf = b64ToBuf(encodedParams)

					// Assert
					expect(inputSize).toBe(40)
					expect(buf.subarray(0, 32).equals(RAW32)).toBe(true)
					const expectedU64 = BigInt(assetNameToUint64(ASSET_NAME_MOCK))
					expect(readU64LE(buf, 32)).toBe(expectedU64)
				})

				it('encodes Asset[16] with padding of zero-structs', () => {
					// Arrange
					const fields: QUtilInputOutput[] = [{ name: 'assets', type: 'Asset[16]' }]
					const params = { assets: [ASSET_STRUCT_MOCK] }
					const expectedU64 = BigInt(assetNameToUint64(ASSET_NAME_MOCK))
					const lastOffset = 15 * 40

					// Act
					const { encodedParams, inputSize } = encodeParams(params, fields)
					const buf = b64ToBuf(encodedParams)

					// Assert
					expect(inputSize).toBe(16 * 40)
					expect(buf.subarray(0, 32).equals(RAW32)).toBe(true)
					expect(readU64LE(buf, 32)).toBe(expectedU64)
					expect(buf.subarray(lastOffset, lastOffset + 40).equals(zeros(40))).toBe(true)
				})
			})

			describe('QUtilPoll', () => {
				it('encodes a QUtilPoll instance via the ABI (736 bytes)', () => {
					// Arrange
					const pollValue = {
						poll_name: 'MyPoll',
						poll_type: 2,
						min_amount: 1000,
						is_active: 1,
						creator: RAW32_HEX, // semantic: address
						allowed_assets: [ASSET_STRUCT_MOCK],
						num_assets: 1
					}
					const fields: QUtilInputOutput[] = [{ name: 'poll', type: 'QUtilPoll' }]
					const assetsStart = 88
					const expectedU64 = BigInt(assetNameToUint64(ASSET_NAME_MOCK))

					// Act
					const { encodedParams, inputSize } = encodeParams({ poll: pollValue }, fields)
					const buf = b64ToBuf(encodedParams)

					// Assert
					expect(inputSize).toBe(736)
					expect(buf.subarray(0, 6).toString('utf-8')).toBe('MyPoll')
					expect(readU64LE(buf, 32)).toBe(2n)
					expect(readU64LE(buf, 40)).toBe(1000n)
					expect(readU64LE(buf, 48)).toBe(1n)
					expect(buf.subarray(56, 88).equals(RAW32)).toBe(true)
					expect(buf.subarray(assetsStart, assetsStart + 32).equals(RAW32)).toBe(true)
					expect(readU64LE(buf, assetsStart + 32)).toBe(expectedU64)
					expect(readU64LE(buf, assetsStart + 640)).toBe(1n)
				})
			})
		})

		// -----------------------------------------------------------------------
		// ABI functions (your requested group)
		// -----------------------------------------------------------------------
		describe('ABI functions', () => {
			describe('getCurrentPollId', () => {
				it('encodes empty parameters correctly', () => {
					// Arrange
					const fields = QUTIL_ABI.functions.getCurrentPollId.inputs
					const params = {}

					// Act
					const result = encodeParams(params, fields)

					// Assert
					expect(result.encodedParams).toBe('')
					expect(result.inputSize).toBe(0)
				})
			})

			describe('getPollsByCreator', () => {
				it('encodes creator address parameter correctly', () => {
					// Arrange
					const fields = QUTIL_ABI.functions.getPollsByCreator.inputs
					const params = {
						creator: RAW32_HEX
					}

					// Act
					const result = encodeParams(params, fields)

					// Assert
					expect(result.encodedParams).toBeDefined()
					expect(result.encodedParams.length).toBeGreaterThan(0)
					expect(result.inputSize).toBe(32) // id → 32 bytes
				})
			})

			describe('getPollInfo', () => {
				it('encodes poll_id parameter correctly', () => {
					// Arrange
					const fields = QUTIL_ABI.functions.getPollInfo.inputs
					const params = { poll_id: 123 }

					// Act
					const result = encodeParams(params, fields)

					// Assert
					expect(result.encodedParams).toBeDefined()
					expect(result.encodedParams.length).toBeGreaterThan(0)
					expect(result.inputSize).toBe(8) // uint64 → 8 bytes
				})
			})

			describe('createPoll', () => {
				it('encodes createPoll input parameters correctly', () => {
					const result = encodeParams(
						CREATE_POLL_INPUT_PARAMS_MOCK,
						QUTIL_ABI.functions.createPoll.inputs
					)

					expect(result.encodedParams).toBe(CREATE_POLL_INPUT_ENCODED_PARAMS_EXPECTED)
					// poll_name (32) + poll_type (8) + min_amount (8) + github_link (256) + allowed_assets (16 * 40) + num_assets (8)
					expect(result.inputSize).toBe(QUTIL_CONFIG.POLL_CREATION_EXPECTED_SIZE)
				})
			})
		})
	})
})
