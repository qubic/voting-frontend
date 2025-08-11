import { vi } from 'vitest'

// Mock the logger
vi.mock('@/lib/logger', () => ({
	LogFeature: {
		DECODERS: 'DECODERS',
		QUTIL_CONTRACT_HOOK: 'QUTIL_CONTRACT_HOOK'
	},
	makeLog: () => vi.fn()
}))

// Mock the qubic helper
vi.mock('@/lib/qubic/utils', () => ({
	qHelper: {
		getIdentity: vi.fn((bytes: Uint8Array) => {
			// Return a mock identity string
			return Array.from(bytes)
				.map((b) => b.toString(16).padStart(2, '0'))
				.join('')
		})
	},
	resolveSize: vi.fn((sizeStr?: string): number => {
		if (!sizeStr) return 0
		if (/^\d+$/.test(sizeStr)) return parseInt(sizeStr, 10)
		return 0
	})
}))

// Mock the converters
vi.mock('@/lib/qubic/converters', () => ({
	byteArrayToHexString: vi.fn((bytes: Uint8Array) => {
		return Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')
	}),
	uint64ToAssetName: vi.fn((uint64Value: string) => {
		// Mock implementation that returns a readable asset name
		// For testing purposes, return 'CFB' for the first asset and empty for others
		if (uint64Value === '0') return ''
		// This is a simplified mock - in real usage it would decode the uint64 to bytes
		return 'CFB'
	}),
	hexToBase32: vi.fn((hexString: string) => {
		// Mock implementation that converts hex to base32
		// For testing purposes, return the expected Qubic ID format
		if (hexString === '4346424d454d5a4f49444558514155585959535a4955524144514c415057504d') {
			return 'CFBMEMZOIDEXQAUXYYSZIURADQLAPWPMNJXQSNVQZAHYVOPYUKKJBJUCTVJL'
		}
		// For other hex strings, return a mock base32 string
		return 'MOCKBASE32ID' + hexString.substring(0, 10)
	})
}))

// Mock QubicDefinitions
vi.mock('@qubic-lib/qubic-ts-library/dist/QubicDefinitions', () => ({
	QubicDefinitions: {
		PUBLIC_KEY_LENGTH: 32
	}
}))
