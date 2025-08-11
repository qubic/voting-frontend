import base64 from 'base-64'
import { Buffer } from 'buffer'
import { base32 as rfcBase32 } from 'rfc4648'

import { NULL_ID, QUBIC_ID_SIZE } from './constants'
import type { QUtilInputOutput, QUtilParamType } from './contracts/qutil.abi'
import { isStructType, resolveType } from './contracts/qutil.abi'
import { assetNameToUint64, toBigInt } from './converters'
import { isHex64String, isQubicBase32IdString, isQUtilArrayType } from './guards'
import { safeParse } from './parsers'
import { qHelper } from './utils'

const EMPTY_ID_BUFFER = Buffer.alloc(QUBIC_ID_SIZE)

/* -----------------------------------
   Helpers
----------------------------------- */

function getElementTypeAndLength(typeName: string): {
	elementType: QUtilParamType
	length: number
} {
	const match = RegExp(/^(.+)\[(\d+)\]$/).exec(typeName)
	if (!match) throw new Error(`Type "${typeName}" is not a fixed array type`)
	return { elementType: match[1] as QUtilParamType, length: parseInt(match[2], 10) }
}

/* -----------------------------------
   ID encoders
----------------------------------- */

function encodeIdAsText(value: unknown): Buffer {
	const fixed = Buffer.alloc(QUBIC_ID_SIZE)
	if (value == null) return fixed
	const utf8Buffer = Buffer.from(String(value), 'utf-8')
	utf8Buffer.copy(fixed, 0, 0, Math.min(utf8Buffer.length, fixed.length))
	return fixed
}

function encodeIdAsAddress(value: unknown): Buffer {
	try {
		const valueString = String(value ?? '').trim()

		if (!valueString || valueString === NULL_ID) return EMPTY_ID_BUFFER

		if (value instanceof Uint8Array && value.length === QUBIC_ID_SIZE) {
			return Buffer.from(value)
		}

		if (isHex64String(valueString)) {
			return Buffer.from(valueString, 'hex')
		}

		try {
			const identityBytes = qHelper.getIdentityBytes(valueString)
			if (identityBytes && identityBytes.length === QUBIC_ID_SIZE) {
				return Buffer.from(identityBytes)
			}
		} catch {
			/* fall through */
		}

		if (isQubicBase32IdString(valueString)) {
			const decoded = rfcBase32.parse(valueString, { loose: false })
			if (decoded.length === QUBIC_ID_SIZE) return Buffer.from(decoded)
			console.warn(
				`[encodeIdAsAddress] Base32 decoded length ${decoded.length} != 32; using zero buffer`
			)
			return EMPTY_ID_BUFFER
		}

		console.warn(`[encodeIdAsAddress] Invalid ID string "${valueString}"; using zero buffer`)
		return EMPTY_ID_BUFFER
	} catch (error) {
		console.error('[encodeIdAsAddress] Error:', error)
		return EMPTY_ID_BUFFER
	}
}

/* -----------------------------------
   Primitive encoders (no ABI recursion)
----------------------------------- */

function encodePrimitiveValue(
	value: unknown,
	type: QUtilParamType,
	semantic?: 'address' | 'text'
): Buffer {
	switch (type) {
		case 'uint8': {
			const buffer = Buffer.alloc(1)
			buffer.writeUInt8(safeParse(value), 0)
			return buffer
		}
		case 'uint16': {
			const buffer = Buffer.alloc(2)
			buffer.writeUInt16LE(safeParse(value), 0)
			return buffer
		}
		case 'uint32': {
			const buffer = Buffer.alloc(4)
			buffer.writeUInt32LE(safeParse(value), 0)
			return buffer
		}
		case 'uint64': {
			const buffer = Buffer.alloc(8)
			buffer.writeBigUInt64LE(toBigInt(value), 0)
			return buffer
		}

		case 'int8':
		case 'sint8': {
			const buffer = Buffer.alloc(1)
			buffer.writeInt8(safeParse(value), 0)
			return buffer
		}
		case 'int16':
		case 'sint16': {
			const buffer = Buffer.alloc(2)
			buffer.writeInt16LE(safeParse(value), 0)
			return buffer
		}
		case 'int32':
		case 'sint32': {
			const buffer = Buffer.alloc(4)
			buffer.writeInt32LE(safeParse(value), 0)
			return buffer
		}
		case 'int64':
		case 'sint64': {
			const buffer = Buffer.alloc(8)
			buffer.writeBigInt64LE(toBigInt(value), 0)
			return buffer
		}

		case 'bool':
		case 'bit': {
			const buffer = Buffer.alloc(1)
			buffer.writeUInt8(value ? 1 : 0, 0)
			return buffer
		}

		case 'id': {
			return semantic === 'text' ? encodeIdAsText(value) : encodeIdAsAddress(value)
		}

		case 'char[256]': {
			const buffer = Buffer.alloc(256)
			const utf8Buffer = Buffer.from(String(value ?? ''), 'utf-8')
			utf8Buffer.copy(buffer, 0, 0, Math.min(utf8Buffer.length, buffer.length))
			return buffer
		}

		case 'uint8[256]': {
			const buffer = Buffer.alloc(256)
			if (typeof value === 'string') {
				const utf8 = Buffer.from(value, 'utf-8')
				utf8.copy(buffer, 0, 0, Math.min(utf8.length, 256))
				return buffer
			}
			if (Array.isArray(value)) {
				Buffer.from(value as number[]).copy(
					buffer,
					0,
					0,
					Math.min((value as number[]).length, 256)
				)
				return buffer
			}
			return buffer
		}

		default:
			throw new Error(`encodePrimitiveValue: unsupported primitive type "${type}"`)
	}
}

/* -----------------------------------
   Zero-fill helpers to keep alignment safe
----------------------------------- */

function zeroFillForElementType(elementType: QUtilParamType): Buffer {
	if (elementType === 'uint8') return Buffer.alloc(1)
	if (elementType === 'uint64') return Buffer.alloc(8)
	if (elementType === 'id') return EMPTY_ID_BUFFER
	if (elementType === 'Asset') return Buffer.alloc(40)
	if (isStructType(elementType)) {
		return encodeZeroStruct(elementType)
	}
	try {
		return encodePrimitiveValue(0, elementType)
	} catch {
		return Buffer.alloc(0)
	}
}

function encodeZeroStruct(structTypeName: string): Buffer {
	const fields = resolveType(structTypeName)
	if (!fields) return Buffer.alloc(0)
	const buffers: Buffer[] = []
	for (const field of fields) {
		if (isQUtilArrayType(field.type)) {
			const { elementType, length } = getElementTypeAndLength(field.type)
			const parts: Buffer[] = []
			for (let index = 0; index < length; index++) {
				parts.push(zeroFillForElementType(elementType))
			}
			buffers.push(Buffer.concat(parts))
		} else if (field.type === 'id') {
			buffers.push(field.semantic === 'text' ? encodeIdAsText('') : EMPTY_ID_BUFFER)
		} else if (isStructType(field.type)) {
			buffers.push(encodeZeroStruct(field.type))
		} else {
			buffers.push(encodePrimitiveValue(0, field.type))
		}
	}
	return Buffer.concat(buffers)
}

/* -----------------------------------
   Struct + array encoders (ABI-driven)
----------------------------------- */

function normalizeAssetForEncoding(value: unknown): Record<string, unknown> {
	const source = typeof value === 'object' && value ? (value as Record<string, unknown>) : {}
	const normalized: Record<string, unknown> = { ...source }

	// Convert symbol → uint64 decimal string if needed
	const assetNameValue = source.assetName
	if (typeof assetNameValue === 'string' && assetNameValue.trim() !== '') {
		normalized.assetName = assetNameToUint64(assetNameValue.trim())
	}
	return normalized
}

function encodeStructByAbi(structTypeName: string, value: unknown): Buffer {
	const fields = resolveType(structTypeName)
	if (!fields) throw new Error(`Struct definition not found for "${structTypeName}"`)
	if (typeof value !== 'object' || value == null) {
		throw new Error(`Expected object for struct "${structTypeName}", got ${typeof value}`)
	}

	const sourceRecord =
		structTypeName === 'Asset'
			? normalizeAssetForEncoding(value)
			: (value as Record<string, unknown>)

	const buffers: Buffer[] = []
	for (const field of fields) {
		const fieldValue = sourceRecord[field.name]
		buffers.push(encodeByType(fieldValue, field.type, field.semantic))
	}

	return Buffer.concat(buffers)
}

function encodeByType(value: unknown, type: QUtilParamType, semantic?: 'address' | 'text'): Buffer {
	if (isStructType(type)) {
		return encodeStructByAbi(type, value)
	}

	if (type === 'uint8[256]') {
		return encodePrimitiveValue(value, 'uint8[256]')
	}

	if (type === 'char[256]') {
		return encodePrimitiveValue(value, 'char[256]')
	}

	if (isQUtilArrayType(type)) {
		const { elementType, length } = getElementTypeAndLength(type)
		const inputArray = Array.isArray(value) ? (value as unknown[]) : []
		const itemBuffers: Buffer[] = []

		for (let index = 0; index < length; index++) {
			const elementValue = inputArray[index]
			if (typeof elementValue === 'undefined') {
				itemBuffers.push(zeroFillForElementType(elementType))
			} else {
				itemBuffers.push(encodeByType(elementValue, elementType))
			}
		}

		return Buffer.concat(itemBuffers)
	}

	return encodePrimitiveValue(value, type, semantic)
}

/* -----------------------------------
   Field + function parameter encoders
----------------------------------- */

export function encodeParams(
	params: Record<string, unknown>,
	inputFields: QUtilInputOutput[] = []
): { encodedParams: string; inputSize: number } {
	if (!params || inputFields.length === 0) {
		return { encodedParams: '', inputSize: 0 }
	}

	const buffers = inputFields.map((field) => {
		const fieldValue = params[field.name]
		return encodeByType(fieldValue, field.type, field.semantic)
	})

	const finalBuffer = Buffer.concat(buffers)
	const base64Encoded = base64.encode(String.fromCharCode(...new Uint8Array(finalBuffer)))
	return { encodedParams: base64Encoded, inputSize: finalBuffer.length }
}
