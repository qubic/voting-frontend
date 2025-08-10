import type { z } from 'zod'

import type { ContractResponse } from './types'

/**
 * Generic helper function for validating contract responses
 * This function takes decoded contract data and validates it against a Zod schema
 *
 * @param decoded - The decoded contract response from decodeContractResponse
 * @param schema - The Zod schema to validate against
 * @param context - Context string for error logging (e.g., function name)
 * @returns Object with validation result and validated data or error
 */
export const validateContractResponse = <T>(
	decoded: { success: boolean; data: Record<string, unknown> | null; error?: string },
	schema: z.ZodSchema<T>,
	context: string
): ContractResponse<T> => {
	if (!decoded.success || !decoded.data) {
		return { success: false, data: null, error: decoded.error || 'No data received' }
	}

	try {
		const validatedData = schema.parse(decoded.data)
		return { success: true, data: validatedData, error: null }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
		console.error(`${context} - validation error:`, { error, data: decoded.data })
		return {
			success: false,
			data: null,
			error: `Validation failed: ${errorMessage}`
		}
	}
}
