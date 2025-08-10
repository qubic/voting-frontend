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
	})
}))

// Mock QubicDefinitions
vi.mock('@qubic-lib/qubic-ts-library/dist/QubicDefinitions', () => ({
	QubicDefinitions: {
		PUBLIC_KEY_LENGTH: 32
	}
}))
