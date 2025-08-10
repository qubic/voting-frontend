import base64 from 'base-64'
import { Buffer } from 'buffer'

import { QubicDefinitions } from '@qubic-lib/qubic-ts-library/dist/QubicDefinitions'

import { byteArrayToHexString } from './converters'
import { qHelper, resolveSize } from './utils'

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

/**
 * Decodes a smart contract response based on the expected output fields
 */
export const decodeContractResponse = (
	responseData: string,
	outputFields: Array<{ name: string; type: string; size?: string; elementType?: string }>
): DecodeResult => {
	if (!responseData || responseData.length === 0) {
		return { success: true, data: null, rawHex: '', byteLength: 0 }
	}

	try {
		const buffer = Buffer.from(base64.decode(responseData), 'binary')
		const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
		const hex = byteArrayToHexString(new Uint8Array(buffer))

		let currentOffset = 0
		const decoded = outputFields.reduce<Record<string, unknown>>((acc, field) => {
			// Handle fixed-size array types like uint64[64]
			const arrayMatch = RegExp(/^(.+)\[(\d+)\]$/).exec(field.type)

			if (arrayMatch) {
				const elementType = arrayMatch[1]
				const size = parseInt(arrayMatch[2], 10)

				const items = Array.from({ length: size }).map(() => {
					const result = decodeValue(dv, currentOffset, elementType)
					currentOffset += result.readSize
					return result.value
				})
				return { ...acc, [field.name]: items }
			}

			// Handle legacy array types
			if (field.type === 'Array' && field.elementType) {
				const size = resolveSize(field.size)

				const items = Array.from({ length: size }).map(() => {
					const result = decodeValue(dv, currentOffset, field.elementType!)
					currentOffset += result.readSize
					return result.value
				})
				return { ...acc, [field.name]: items }
			}

			// Handle single values
			const result = decodeValue(dv, currentOffset, field.type)
			currentOffset += result.readSize
			return { ...acc, [field.name]: result.value }
		}, {})

		return {
			success: true,
			data: decoded,
			rawHex: hex,
			byteLength: buffer.length
		}
	} catch (error) {
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error'
		}
	}
}

/**
 * Decodes a single value from the DataView at the specified offset
 */
export const decodeValue = (
	dv: DataView,
	offset: number,
	type: string,
	size = 0
): DecodeValueResult => {
	const read = <T>(fn: () => T, length: number): DecodeValueResult => ({
		value: fn(),
		readSize: length
	})

	// Integer types
	if (type === 'uint64') {
		try {
			const value = dv.getBigUint64(offset, true).toString()
			return { value, readSize: 8 }
		} catch (error) {
			return { value: `[Error reading uint64: ${error}]`, readSize: 8 }
		}
	}
	if (type === 'int64') return read(() => dv.getBigInt64(offset, true).toString(), 8)
	if (type === 'uint32') return read(() => dv.getUint32(offset, true), 4)
	if (type === 'int32') return read(() => dv.getInt32(offset, true), 4)
	if (type === 'uint16') return read(() => dv.getUint16(offset, true), 2)
	if (type === 'int16') return read(() => dv.getInt16(offset, true), 2)
	if (type === 'uint8') return read(() => dv.getUint8(offset), 1)
	if (type === 'int8') return read(() => dv.getInt8(offset), 1)

	// Boolean types
	if (type === 'bit' || type === 'bool') return read(() => dv.getUint8(offset) !== 0, 1)

	// ID type (32-byte public key)
	if (type === 'id') {
		const slice = new Uint8Array(
			dv.buffer,
			dv.byteOffset + offset,
			QubicDefinitions.PUBLIC_KEY_LENGTH
		)
		return {
			value: qHelper.getIdentity(slice),
			readSize: QubicDefinitions.PUBLIC_KEY_LENGTH
		}
	}

	// Fixed-length UTF-8 string (char[N])
	if (type.startsWith('char[')) {
		const match = RegExp(/\[(\d+)\]/).exec(type)
		const charSize = match ? Number(match[1]) : size
		const bytes = new Uint8Array(dv.buffer, dv.byteOffset + offset, charSize)
		const nullIndex = bytes.indexOf(0)
		const end = nullIndex >= 0 ? nullIndex : charSize
		return { value: Buffer.from(bytes.slice(0, end)).toString('utf-8'), readSize: charSize }
	}

	return { value: `[Unsupported Type: ${type}]`, readSize: 0 }
}
