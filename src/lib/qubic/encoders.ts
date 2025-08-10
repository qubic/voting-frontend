import base64 from 'base-64'
import { Buffer } from 'buffer'

import { QubicDefinitions } from '@qubic-lib/qubic-ts-library/dist/QubicDefinitions'

import type { AssetSchema, CreatePollFormData } from '@/lib/qubic/schemas'

import { LogFeature, makeLog } from '../logger'

import { DEFAULT_CHAR_SIZE, NULL_ID, QUTIL_CONFIG } from './constants'
import { assetNameToUint64, toBigInt } from './converters'
import { safeParse, safeParseArray } from './parsers'
import type { EncodeParams, EncodeValue, InputField } from './types'
import { qHelper, resolveSize } from './utils'

const log = makeLog(LogFeature.ENCODERS)

/**
 * Encodes an ID into a 32-byte Buffer
 * Returns a zero buffer on error
 */
function encodeId(value: unknown): Buffer {
	try {
		const idBytes = qHelper.getIdentityBytes(String(value))

		if (idBytes && idBytes.length === QubicDefinitions.PUBLIC_KEY_LENGTH) {
			return Buffer.from(idBytes) // returns a fresh 32-byte buffer
		}
		console.warn(`Invalid ID format or length for value: ${value}. Using zero buffer.`)
		return Buffer.alloc(0)
	} catch (err) {
		console.error(`Error converting ID "${value}" to bytes:`, err)
		return Buffer.alloc(0)
	}
}

/**
 * Encodes a value into a Buffer
 * @param value - The value to encode
 * @param type - The type of the value
 * @param sizeOverride - The size of the value
 * @returns A Buffer
 */
export function encodeValue(value: unknown, type: EncodeValue, sizeOverride = 0): Buffer {
	switch (type) {
		// Unsigned integers
		case 'uint8': {
			const buf = Buffer.alloc(1)
			buf.writeUInt8(safeParse(value), 0)
			return buf
		}
		case 'uint16': {
			const buf = Buffer.alloc(2)
			buf.writeUInt16LE(safeParse(value), 0)
			return buf
		}
		case 'uint32': {
			const buf = Buffer.alloc(4)
			buf.writeUInt32LE(safeParse(value), 0)
			return buf
		}
		case 'uint64': {
			const buf = Buffer.alloc(8)
			buf.writeBigUInt64LE(toBigInt(value), 0)
			return buf
		}

		// Signed integers
		case 'int8':
		case 'sint8': {
			const buf = Buffer.alloc(1)
			buf.writeInt8(safeParse(value), 0)
			return buf
		}
		case 'int16':
		case 'sint16': {
			const buf = Buffer.alloc(2)
			buf.writeInt16LE(safeParse(value), 0)
			return buf
		}
		case 'int32':
		case 'sint32': {
			const buf = Buffer.alloc(4)
			buf.writeInt32LE(safeParse(value), 0)
			return buf
		}
		case 'int64':
		case 'sint64': {
			const buf = Buffer.alloc(8)
			buf.writeBigInt64LE(toBigInt(value), 0)
			return buf
		}

		// Boolean or bit
		case 'bool':
		case 'bit': {
			const buf = Buffer.alloc(1)
			buf.writeUInt8(value ? 1 : 0, 0)
			return buf
		}

		// ID type (32-byte public key)
		case 'id': {
			return encodeId(value)
		}

		// Fixed-length UTF-8 string (char[N])
		default: {
			const charMatch = RegExp(/^char\[(\d+)\]$/).exec(type)
			if (charMatch) {
				const charSize = parseInt(charMatch[1], 10) || sizeOverride || DEFAULT_CHAR_SIZE
				const buf = Buffer.alloc(charSize)
				const strBuf = Buffer.from(String(value || ''), 'utf-8')
				strBuf.copy(buf, 0, 0, Math.min(strBuf.length, charSize))
				return buf
			}
		}
	}

	console.warn(`Unsupported type: ${type}. Returning empty buffer.`)
	return Buffer.alloc(0)
}

/**
 * Encodes a single asset into binary according to the C++ Asset struct
 * @param asset - The asset to encode Asset struct has: issuer (32-byte id) and assetName (8-byte uint64)
 * @returns An array of Buffers
 */
const encodePollAsset = (asset: AssetSchema): Buffer[] => [
	encodeValue(asset.issuer, 'id'), // issuer is 32-byte id
	encodeValue(asset.assetName, 'uint64') // assetName is 8-byte uint64
]

/**
 * Encodes a single field into a Buffer
 * @param field - The field to encode
 * @param value - The value to encode
 * @returns A Buffer
 */
const encodeField = (field: InputField, value: unknown): Buffer[] => {
	if (field.type === 'Array') {
		const items = safeParseArray(value, field.name)
		const size = resolveSize(field.size)

		if (size === 0) {
			console.warn(`Skipping field "${field.name}" — unresolved array size: "${field.size}"`)
			return []
		}

		return Array.from({ length: size }, (_, i) =>
			encodeValue(items[i], field.elementType as EncodeValue)
		)
	}

	// Handle custom types
	if (field.type === 'Asset') {
		// Asset type is a custom struct with issuer (id) and assetName (uint64)
		const asset = value as AssetSchema
		return encodePollAsset(asset)
	}

	return [encodeValue(value, field.type)]
}

/**
 * Encodes parameters for the smart contract requestData (base64-encoded)
 * @param params - The parameters to encode
 * @param inputFields - The fields to encode with its type and name
 * @returns An object with the encoded parameters and the size of the input
 */
export function encodeParams(
	params: EncodeParams,
	inputFields: InputField[] = []
): { encodedParams: string; inputSize: number } {
	try {
		log('encodeParams - params', { params })
		log('encodeParams - inputFields', { inputFields })

		if (!params || inputFields.length === 0) return { encodedParams: '', inputSize: 0 }

		const buffers = inputFields.flatMap((field) => encodeField(field, params[field.name]))

		log('encodeParams - buffers', { buffers })

		const finalBuffer = Buffer.concat(buffers)
		log('encodeParams - finalBuffer', { finalBuffer })

		const bytes = new Uint8Array(finalBuffer)

		log('encodeParams - bytes', { bytes })

		return {
			encodedParams: base64.encode(String.fromCharCode(...bytes)),
			inputSize: bytes.length
		}
	} catch (err) {
		console.error('Error encoding params:', err)
		throw err
	}
}

/**
 * Encodes CreatePollFormData for the smart contract requestData (base64-encoded)
 * Creates the binary representation of each value according to the C++ struct layout
 * And then encodes the binary representation to base64
 * C++ CreatePoll_input struct:
 * - id poll_name;                                    // 32 bytes
 * - uint64 poll_type;                                // 8 bytes
 * - uint64 min_amount;                               // 8 bytes
 * - Array<uint8, QUTIL_POLL_GITHUB_URL_MAX_SIZE> github_link; // 256 bytes
 * - Array<Asset, QUTIL_MAX_ASSETS_PER_POLL> allowed_assets;   // 16 * (32 + 8) = 640 bytes
 * - uint64 num_assets;                               // 8 bytes
 *
 * Total size: 32 + 8 + 8 + 256 + 640 + 8 = 952 bytes
 */
export function encodeCreatePollFormToBase64(data: CreatePollFormData): string {
	// Filter and validate assets
	const contractAssets = (data.allowed_assets ?? [])
		.filter((asset) => asset.issuer && asset.assetName)
		.map((asset) => ({
			issuer: asset.issuer.trim(),
			assetName: assetNameToUint64(asset.assetName.trim())
		}))

	// Pad to 16 assets with NULL_ID and 0 assetName
	const paddedAssets = [
		...contractAssets,
		...Array.from({ length: Math.max(0, 16 - contractAssets.length) }, () => ({
			issuer: NULL_ID,
			assetName: '0',
			contractIndex: 0
		}))
	]

	// Build the buffer according to the C++ struct layout
	const buffers: Buffer[] = [
		encodeValue(data.poll_name, 'id'), // poll_name is 32-byte id
		encodeValue(data.poll_type, 'uint64'), // poll_type is 8-byte uint64
		encodeValue(data.min_amount, 'uint64'), // min_amount is 8-byte uint64
		encodeValue(data.github_link, 'char[256]'), // github_link is 256-byte char array
		...paddedAssets.flatMap(encodePollAsset), // 16 assets * (32 + 8) = 640 bytes
		encodeValue(contractAssets.length, 'uint64') // num_assets is 8-byte uint64
	]

	const finalBuffer = Buffer.concat(buffers)

	const bytes = new Uint8Array(finalBuffer)

	log('encodeCreatePollFormToBase64 - Encoded finalBuffer size:', finalBuffer.length)
	log('encodeCreatePollFormToBase64 - Expected size:', QUTIL_CONFIG.POLL_CREATION_EXPECTED_SIZE)

	// Validate buffer size
	if (finalBuffer.length !== QUTIL_CONFIG.POLL_CREATION_EXPECTED_SIZE) {
		log(
			`encodeCreatePollFormToBase64 - Buffer size mismatch! Expected ${QUTIL_CONFIG.POLL_CREATION_EXPECTED_SIZE} bytes, got ${finalBuffer.length} bytes`
		)
	}

	return base64.encode(String.fromCharCode(...bytes))
}
