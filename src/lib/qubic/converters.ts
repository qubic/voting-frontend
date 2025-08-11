export const toBigInt = (v: unknown) => {
	const n = v ?? 0
	if (typeof n === 'bigint') return n
	if (typeof n === 'number' && Number.isFinite(n)) return BigInt(n)
	if (typeof n === 'string' && n.trim() !== '') return BigInt(n)
	return BigInt(0)
}

/**
 * Convert asset name string to uint64 (same as QSwap)
 */
export function assetNameToUint64(assetName: string) {
	// In the C++ code, asset names are stored as 8-byte char arrays
	// We need to convert the string to match this format
	const paddedName = assetName.padEnd(8, '\0').substring(0, 8)

	const encoder = new TextEncoder()
	const bytes = encoder.encode(paddedName)

	// Pack bytes into uint64 (little-endian)
	let value = 0n
	for (let i = 0; i < 8; i++) {
		value |= BigInt(bytes[i] || 0) << BigInt(i * 8)
	}

	return value.toString()
}

/**
 * Convert uint8 array back to string
 */
export function uint8ArrayToString(uint8Array: Uint8Array) {
	const decoder = new TextDecoder()
	// Find the first null byte to trim the string
	const nullIndex = uint8Array.indexOf(0)
	const trimmedArray = nullIndex >= 0 ? uint8Array.slice(0, nullIndex) : uint8Array
	return decoder.decode(new Uint8Array(trimmedArray)).trim()
}

/**
 * Convert uint64 back to asset name string
 */
export function uint64ToAssetName(uint64Value: string) {
	const value = BigInt(uint64Value)
	const bytes = []

	for (let i = 0; i < 8; i++) {
		const byte = Number((value >> BigInt(i * 8)) & 0xffn)
		if (byte === 0) break
		bytes.push(byte)
	}

	const decoder = new TextDecoder()
	return decoder.decode(new Uint8Array(bytes)).trim()
}

export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
	const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array))
	return btoa(binaryString)
}

export const base64ToUint8Array = (base64: string): Uint8Array => {
	const binaryString = atob(base64)
	return new Uint8Array(binaryString.split('').map((char) => char.charCodeAt(0)))
}

export const byteArrayToHexString = (byteArray: Uint8Array) => {
	const hexString = Array.from(byteArray, (byte) => byte.toString(16).padStart(2, '0')).join('')
	return hexString
}

/**
 * Convert hex string to base32 (Qubic ID format)
 * This converts a 64-character hex string to a 60-character base32 string
 */
export const hexToBase32 = (hexString: string): string => {
	// Base32 alphabet used by Qubic (A-Z, 2-7)
	const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

	// Convert hex to binary
	let binary = ''
	for (const element of hexString) {
		const hexChar = element
		const decimal = parseInt(hexChar, 16)
		binary += decimal.toString(2).padStart(4, '0')
	}

	// Convert binary to base32
	let base32 = ''
	for (let i = 0; i < binary.length; i += 5) {
		const chunk = binary.slice(i, i + 5)
		if (chunk.length === 5) {
			const decimal = parseInt(chunk, 2)
			base32 += base32Alphabet[decimal]
		}
	}

	// Ensure we get exactly 60 characters
	return base32.slice(0, 60)
}
