import type { QUtilParamType } from './contracts/qutil.abi'

/**
 * Checks if a type is an array type
 */
export const isQUtilArrayType = (type: QUtilParamType): type is QUtilParamType => {
	return /^.+\[\d+\]$/.test(type)
}

/**
 * Checks if a type is an integer type
 */
export const isIntegerType = (
	type: QUtilParamType
): type is
	| 'uint64'
	| 'int64'
	| 'uint32'
	| 'int32'
	| 'uint16'
	| 'int16'
	| 'uint8'
	| 'int8'
	| 'sint8'
	| 'sint16'
	| 'sint32'
	| 'sint64' => {
	return [
		'uint64',
		'int64',
		'uint32',
		'int32',
		'uint16',
		'int16',
		'uint8',
		'int8',
		'sint8',
		'sint16',
		'sint32',
		'sint64'
	].includes(type)
}

/**
 * Checks if a type is a boolean type
 */
export const isBooleanType = (type: QUtilParamType): type is 'bit' | 'bool' => {
	return type === 'bit' || type === 'bool'
}

/**
 * Checks if a string is a valid Qubic base32 ID
 */
export const isQubicBase32IdString = (value: string): boolean => /^[A-Z2-7]{56}$/.test(value)

/**
 * Checks if a string is a valid hex64 string
 */
export const isHex64String = (value: string): boolean => /^[0-9a-fA-F]{64}$/.test(value)
