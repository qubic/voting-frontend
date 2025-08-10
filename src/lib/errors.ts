import { JSON_RPC_ERROR_MESSAGES } from '@/constants/errors'

/**
 * Extracts a human-readable error message from different error types.
 *
 * @param {unknown} error - The error object to extract a message from.
 * @returns {string} - The extracted error message.
 */
export const extractErrorMessage = (error: unknown): string => {
	if (!error) return 'Unknown error occurred'

	if (error instanceof Error) {
		return error.message || 'An error occurred'
	}

	if (typeof error === 'string') {
		return error.trim() || 'An error occurred'
	}

	if (typeof error === 'object' && error !== null) {
		try {
			return JSON.stringify(error, null, 2) // Pretty-print for better debugging
		} catch {
			return 'Error object could not be serialized'
		}
	}

	return 'Unexpected error type'
}
/**
 * Extracts a user-friendly toast error message based on JSON-RPC error codes.
 *
 * @param {unknown} error - The error object to extract the message from.
 * @param {(key: string) => string} t - Translation function.
 * @returns {string} - The localized error message.
 */
export function getRPCErrorMessage(error: unknown, t: (key: string) => string): string {
	if (typeof error === 'object' && error !== null && 'code' in error) {
		const errorCode = (error as { code: number }).code
		if (JSON_RPC_ERROR_MESSAGES[errorCode]) {
			return t(JSON_RPC_ERROR_MESSAGES[errorCode])
		}
	}
	return t('errors.unexpected_error')
}
