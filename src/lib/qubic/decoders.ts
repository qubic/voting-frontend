// decoders.ts

/* -----------------------------------
   Imports
----------------------------------- */
import base64 from 'base-64'
import { Buffer } from 'buffer'

import { LogFeature, makeLog } from '../logger'

import { NULL_ID, QUBIC_ID_SIZE } from './constants'
import { resolveType } from './contracts'
import type { QUtilParamType, QUtilSemanticType } from './contracts/qutil.abi'
import { byteArrayToHexString, uint64ToAssetName } from './converters'
import { isBooleanType, isIntegerType, isQUtilArrayType } from './guards'
import { qHelper } from './utils'

const log = makeLog(LogFeature.DECODERS)

/* -----------------------------------
   Public types
----------------------------------- */
export interface DecodeResult {
	success: boolean
	data: Record<string, unknown> | null
	rawHex?: string
	byteLength?: number
	error?: string
}

export interface DecodeValueResult {
	value: unknown
	readSize: number
}

export interface DecoderContext {
	dv: DataView
	offset: number
	fieldName?: string
}

/* -----------------------------------
   Primitive decoders
----------------------------------- */
/**
 * Decodes integer types
 */
const decodeInteger = (dv: DataView, offset: number, type: QUtilParamType): DecodeValueResult => {
	const read = <T>(fn: () => T, length: number): DecodeValueResult => ({
		value: fn(),
		readSize: length
	})

	switch (type) {
		case 'uint64':
			try {
				const value = dv.getBigUint64(offset, true)
				return { value: Number(value), readSize: 8 }
			} catch {
				return { value: 0, readSize: 8 }
			}
		case 'int64':
			return read(() => Number(dv.getBigInt64(offset, true)), 8)
		case 'uint32':
			return read(() => dv.getUint32(offset, true), 4)
		case 'int32':
			return read(() => dv.getInt32(offset, true), 4)
		case 'uint16':
			return read(() => dv.getUint16(offset, true), 2)
		case 'int16':
			return read(() => dv.getInt16(offset, true), 2)
		case 'uint8':
			return read(() => dv.getUint8(offset), 1)
		case 'int8':
			return read(() => dv.getInt8(offset), 1)
		case 'sint8':
			return read(() => dv.getInt8(offset), 1)
		case 'sint16':
			return read(() => dv.getInt16(offset, true), 2)
		case 'sint32':
			return read(() => dv.getInt32(offset, true), 4)
		case 'sint64':
			return read(() => Number(dv.getBigInt64(offset, true)), 8)
		default:
			throw new Error(`Unsupported integer type: ${type}`)
	}
}

/**
 * Decodes boolean types
 */
const decodeBoolean = (dv: DataView, offset: number): DecodeValueResult => {
	return {
		value: dv.getUint8(offset) !== 0,
		readSize: 1
	}
}

/* -----------------------------------
   ID decoders
----------------------------------- */
/**
 * Decodes ID type (32-byte identifier)
 */
const decodeId = async (
	dv: DataView,
	offset: number,
	isIdentity: boolean = false
): Promise<DecodeValueResult> => {
	const slice = new Uint8Array(dv.buffer, dv.byteOffset + offset, QUBIC_ID_SIZE)

	if (isIdentity) {
		log('decodeId - isIdentity', slice)

		// Check if this is a null ID (all zeros)
		const isNullId = slice.every((byte) => byte === 0)
		if (isNullId) {
			return {
				value: NULL_ID,
				readSize: QUBIC_ID_SIZE
			}
		}

		const identity = await qHelper.getIdentity(slice)
		log('decodeId - identity:', identity)
		return {
			value: identity,
			readSize: QUBIC_ID_SIZE
		}
	} else {
		log('decodeId - isText', slice)
		// Convert bytes to readable string by removing null bytes
		const nullIndex = slice.indexOf(0)
		const end = nullIndex >= 0 ? nullIndex : slice.length
		const readableBytes = slice.slice(0, end)
		const readableText = Buffer.from(readableBytes).toString('utf-8')
		return {
			value: readableText,
			readSize: QUBIC_ID_SIZE
		}
	}
}

/* -----------------------------------
   Struct + array decoders (ABI-driven)
----------------------------------- */
/**
 * Decodes Asset type
 */
const decodeAsset = async (dv: DataView, offset: number): Promise<DecodeValueResult> => {
	// issuer (id - 32 bytes) - treat as identity since it's a Qubic address
	const issuerResult = await decodeId(dv, offset, true)

	// assetName (uint64 - 8 bytes)
	const assetNameResult = decodeInteger(dv, offset + issuerResult.readSize, 'uint64')
	const assetNameValue = assetNameResult.value as number
	const assetName = assetNameValue === 0 ? 'N/A' : uint64ToAssetName(String(assetNameValue))

	return {
		value: {
			issuer: issuerResult.value,
			assetName
		},
		readSize: issuerResult.readSize + assetNameResult.readSize
	}
}

/**
 * Decodes QUtilPoll struct
 */
const decodeQUtilPoll = async (dv: DataView, offset: number): Promise<DecodeValueResult> => {
	let currentOffset = offset
	const pollData: Record<string, unknown> = {}

	const pollFields = resolveType('QUtilPoll')

	if (!pollFields) {
		throw new Error('QUtilPoll struct definition not found in ABI')
	}

	for (const field of pollFields) {
		if (field.type === 'Asset[16]') {
			// Handle array type specially
			const result = await decodeAssetArray(dv, currentOffset, 16)
			pollData[field.name] = result.value
			currentOffset += result.readSize
		} else {
			const result = await decodeValue(dv, currentOffset, field.type, field.semantic)
			pollData[field.name] = result.value
			currentOffset += result.readSize
		}
	}

	log(`QUtilPoll struct decoded, total size: ${currentOffset - offset} bytes`)

	return {
		value: pollData,
		readSize: currentOffset - offset
	}
}

/**
 * Decodes array types
 */
const decodeArrayType = async (
	dv: DataView,
	offset: number,
	type: QUtilParamType
): Promise<DecodeValueResult> => {
	const arrayMatch = type.match(/^(.+)\[(\d+)\]$/)
	if (!arrayMatch) {
		throw new Error(`Invalid array type: ${type}`)
	}

	const elementType = arrayMatch[1] as QUtilParamType
	const size = parseInt(arrayMatch[2], 10)

	log(`Array type detected: ${elementType}[${size}]`)

	// Special case: uint8 arrays should be decoded as strings for text fields
	// like poll_link (GitHub URLs)
	if (elementType === 'uint8') {
		return decodeUint8Array(dv, offset, size)
	}

	const items: unknown[] = []
	let currentOffset = offset

	for (let i = 0; i < size; i++) {
		const result = await decodeValue(dv, currentOffset, elementType)
		items.push(result.value)
		currentOffset += result.readSize
	}

	return {
		value: items,
		readSize: currentOffset - offset
	}
}

/**
 * Decodes uint8 array (for poll_link)
 */
const decodeUint8Array = (
	dv: DataView,
	offset: number,
	expectedSize: number
): DecodeValueResult => {
	log(`Processing uint8 array, expected size: ${expectedSize}`)

	// Check if we have enough bytes left in the buffer
	const remainingBytes = dv.byteLength - offset
	log(`Remaining bytes in buffer: ${remainingBytes}, requested: ${expectedSize}`)

	// Safety check: if we're already past the buffer, return empty result
	if (remainingBytes <= 0) {
		console.warn(`Buffer overflow detected: offset ${offset}, buffer size ${dv.byteLength}`)
		return {
			value: '',
			readSize: 0
		}
	}

	// Use the actual remaining bytes, not the expected size
	const actualSize = Math.min(remainingBytes, expectedSize)

	// Additional safety check
	if (actualSize <= 0) {
		console.warn(`Invalid size calculated: ${actualSize}`)
		return {
			value: '',
			readSize: 0
		}
	}

	const slice = new Uint8Array(dv.buffer, dv.byteOffset + offset, actualSize)

	// Convert bytes to readable string by removing null bytes
	const nullIndex = slice.indexOf(0)
	const end = nullIndex >= 0 ? nullIndex : actualSize
	const readableBytes = slice.slice(0, end)
	const readableText = Buffer.from(readableBytes).toString('utf-8')
	log(`uint8 array decoded to: "${readableText}" (size: ${actualSize})`)

	return {
		value: readableText,
		readSize: actualSize
	}
}

/**
 * Decodes uint64 array
 */
const decodeUint64Array = (dv: DataView, offset: number, size: number): DecodeValueResult => {
	const array: number[] = []
	let currentOffset = offset

	for (let i = 0; i < size; i++) {
		const result = decodeInteger(dv, currentOffset, 'uint64')
		array.push(result.value as number)
		currentOffset += result.readSize
	}

	return {
		value: array,
		readSize: currentOffset - offset
	}
}

/**
 * Decodes Asset array
 */
const decodeAssetArray = async (
	dv: DataView,
	offset: number,
	size: number
): Promise<DecodeValueResult> => {
	const items: unknown[] = []
	let currentOffset = offset

	for (let i = 0; i < size; i++) {
		const result = await decodeAsset(dv, currentOffset)
		items.push(result.value)
		currentOffset += result.readSize
	}

	return {
		value: items,
		readSize: currentOffset - offset
	}
}

/* -----------------------------------
   Unified value dispatcher
----------------------------------- */
/**
 * Decodes a single value based on its type
 */
const decodeValue = async (
	dv: DataView,
	offset: number,
	type: QUtilParamType,
	semantic?: QUtilSemanticType
): Promise<DecodeValueResult> => {
	if (type === 'id') {
		return decodeId(dv, offset, semantic === 'address')
	}

	if (isIntegerType(type)) {
		return decodeInteger(dv, offset, type)
	}

	if (isBooleanType(type)) {
		return decodeBoolean(dv, offset)
	}

	if (type === 'Asset') {
		return decodeAsset(dv, offset)
	}

	if (type === 'QUtilPoll') {
		return decodeQUtilPoll(dv, offset)
	}

	// Handle array types
	if (type === 'uint64[64]') {
		return decodeUint64Array(dv, offset, 64)
	}

	if (type === 'Asset[16]') {
		return decodeAssetArray(dv, offset, 16)
	}

	if (type === 'uint8[256]') {
		// For poll_link field
		return decodeUint8Array(dv, offset, 256) // QUTIL_POLL_GITHUB_URL_MAX_SIZE
	}

	throw new Error(`Unsupported type: ${type}`)
}

/* -----------------------------------
   Field + function output decoders
----------------------------------- */
/**
 * Decodes a single field based on its type
 */
const decodeField = async (
	dv: DataView,
	offset: number,
	field: {
		name: string
		type: QUtilParamType
		size?: string
		elementType?: QUtilParamType
		semantic?: QUtilSemanticType
	}
): Promise<DecodeValueResult> => {
	const { type } = field

	// Handle array types
	if (isQUtilArrayType(type)) {
		return decodeArrayType(dv, offset, type)
	}

	// Handle single values
	return decodeValue(dv, offset, type, field.semantic)
}

/**
 * Decodes multiple fields from the DataView
 */
const decodeFields = async (
	dv: DataView,
	outputFields: Array<{
		name: string
		type: QUtilParamType
		size?: string
		elementType?: QUtilParamType
		semantic?: QUtilSemanticType
	}>
): Promise<Record<string, unknown>> => {
	let currentOffset = 0
	const decoded: Record<string, unknown> = {}

	for (const field of outputFields) {
		log(`Processing field: ${field.name}, type: ${field.type}, currentOffset: ${currentOffset}`)

		const result = await decodeField(dv, currentOffset, field)
		decoded[field.name] = result.value
		currentOffset += result.readSize
	}

	return decoded
}

/* -----------------------------------
   Main (base64 → Uint8Array → object)
----------------------------------- */
/**
 * Main decoder function that orchestrates the decoding process
 */
export const decodeContractResponse = async (
	responseData: string,
	outputFields: Array<{
		name: string
		type: QUtilParamType
		size?: string
		elementType?: QUtilParamType
		semantic?: QUtilSemanticType
	}>
): Promise<DecodeResult> => {
	if (!responseData || responseData.length === 0) {
		return { success: true, data: null, rawHex: '', byteLength: 0 }
	}

	try {
		const buffer = Buffer.from(base64.decode(responseData), 'binary')
		const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
		const hex = byteArrayToHexString(new Uint8Array(buffer))

		log(`Decoding ${buffer.length} bytes, hex: ${hex.substring(0, 100)}...`)

		const decoded = await decodeFields(dv, outputFields)

		log('Decoded result:', JSON.stringify(decoded, null, 2))

		return {
			success: true,
			data: decoded,
			rawHex: hex,
			byteLength: buffer.length
		}
	} catch (error) {
		console.error('Decoding error:', error)
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error'
		}
	}
}
