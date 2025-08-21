import { z } from 'zod'

import { QUTIL_CONFIG } from './constants'
import { POLL_TYPE } from './types'

// ============================================================================
// PRIMITIVE SCHEMAS - Reusable building blocks
// ============================================================================

// QubicId: 60-char uppercase base32 (A-Z, 2-7, 0-9) or hex string
export const QubicIdSchema = z.union([
	z
		.string()
		.length(60, 'QubicId must be exactly 60 characters')
		.regex(
			/^[A-Z0-9]{60}$/,
			'QubicId must be uppercase base32 (A-Z, 0-9), exactly 60 characters'
		),
	z.string().regex(/^[a-fA-F0-9]{64}$/, 'QubicId must be a 64-character hex string')
])
export type QubicIdSchema = z.infer<typeof QubicIdSchema>

// UInt64: unsigned integer (used for contract responses)
export const UInt64Schema = z.number().int().min(0, 'Must be a non-negative integer')
export type UInt64Schema = z.infer<typeof UInt64Schema>

// UInt64Str: stringified unsigned integer (used for amounts, counts, IDs)
export const UInt64StrSchema = z
	.string()
	.regex(/^\d+$/, 'Must be a stringified unsigned integer (uint64)')
export type UInt64StrSchema = z.infer<typeof UInt64StrSchema>

// Int64: signed integer (used for contract responses)
export const Int64Schema = z.number().int()
export type Int64Schema = z.infer<typeof Int64Schema>

// Int64Str: stringified signed integer
export const Int64StrSchema = z
	.string()
	.regex(/^-?\d+$/, 'Must be a stringified signed integer (int64)')
export type Int64StrSchema = z.infer<typeof Int64StrSchema>

// Boolean: 0 = false, 1 = true (used for contract responses)
export const BooleanNumSchema = z.union([z.literal(0), z.literal(1)])
export type BooleanNumSchema = z.infer<typeof BooleanNumSchema>

// Boolean as string: "0" = false, "1" = true
export const BooleanStrSchema = z.string().regex(/^[01]$/, 'Must be "0" (false) or "1" (true)')
export type BooleanStrSchema = z.infer<typeof BooleanStrSchema>

// Asset schema for polls
export const AssetSchema = z.object({
	issuer: z.string().min(1, 'Asset issuer address is required'),
	assetName: z.string().min(1, 'Asset name is required')
})
export type AssetSchema = z.infer<typeof AssetSchema>

// ============================================================================
// ARRAY SCHEMAS - Fixed-size arrays based on contract constants
// ============================================================================

// Fixed-size array of 64 poll IDs (uint64)
export const PollIdsArraySchema = z
	.array(UInt64Schema)
	.max(
		QUTIL_CONFIG.MAX_NUM_OF_POLLS,
		`Must contain at most ${QUTIL_CONFIG.MAX_NUM_OF_POLLS} poll IDs`
	)
export type PollIdsArraySchema = z.infer<typeof PollIdsArraySchema>

// Fixed-size array of 64 voting results (uint64)
export const VotingResultsArraySchema = z
	.array(UInt64Schema)
	.max(
		QUTIL_CONFIG.MAX_OPTIONS,
		`Must contain at most ${QUTIL_CONFIG.MAX_OPTIONS} voting results`
	)
export type VotingResultsArraySchema = z.infer<typeof VotingResultsArraySchema>

// Fixed-size array of 64 voter counts (uint64)
export const VoterCountsArraySchema = z
	.array(UInt64Schema)
	.max(QUTIL_CONFIG.MAX_OPTIONS, `Must contain at most ${QUTIL_CONFIG.MAX_OPTIONS} voter counts`)
export type VoterCountsArraySchema = z.infer<typeof VoterCountsArraySchema>

// Fixed-size array of 256 bytes for GitHub URLs
export const GitHubUrlArraySchema = z
	.array(z.number().int().min(0).max(255))
	.length(
		QUTIL_CONFIG.POLL_GITHUB_URL_MAX_SIZE,
		`Must contain exactly ${QUTIL_CONFIG.POLL_GITHUB_URL_MAX_SIZE} bytes`
	)
export type GitHubUrlArraySchema = z.infer<typeof GitHubUrlArraySchema>

// ============================================================================
// CONTRACT RESPONSE SCHEMAS - Using primitives and arrays
// ============================================================================

export const GetCurrentPollIdResponseSchema = z.object({
	current_poll_id: UInt64Schema.describe('Total number of polls created (current and past)'),
	active_poll_ids: PollIdsArraySchema.describe('Array of active poll IDs'),
	active_count: UInt64Schema.describe('Number of currently active polls')
})
export type GetCurrentPollIdResponse = z.infer<typeof GetCurrentPollIdResponseSchema>

export const GetPollsByCreatorResponseSchema = z.object({
	poll_ids: PollIdsArraySchema.describe('Array of poll IDs created by the specified address'),
	count: UInt64Schema.describe('Number of polls created by the specified address')
})
export type GetPollsByCreatorResponse = z.infer<typeof GetPollsByCreatorResponseSchema>

export const GetCurrentResultResponseSchema = z.object({
	result: VotingResultsArraySchema.describe('Total voting power for each option (0-63)'),
	voter_count: VoterCountsArraySchema.describe('Number of voters for each option (0-63)'),
	is_active: UInt64Schema.describe(
		'Whether the poll is currently active (non-zero = active, 0 = inactive)'
	)
})
export type GetCurrentResultResponse = z.infer<typeof GetCurrentResultResponseSchema>

export const QUtilPollSchema = z.object({
	poll_name: z.string().min(1, 'Poll name is required').describe('Human-readable poll name'),
	poll_type: z.union([z.literal(1), z.literal(2)]).describe('Poll type: 1 = Qubic, 2 = Asset'),
	min_amount: UInt64Schema.describe('Minimum amount required to vote in this poll'),
	is_active: UInt64Schema.describe(
		'Whether the poll is currently active (non-zero = active, 0 = inactive)'
	),
	creator: QubicIdSchema.describe('Address that created the poll'),
	allowed_assets: z
		.array(AssetSchema)
		.max(
			QUTIL_CONFIG.MAX_ASSETS_PER_POLL,
			`Maximum ${QUTIL_CONFIG.MAX_ASSETS_PER_POLL} assets allowed per poll`
		)
		.describe('List of allowed assets for asset-type polls'),
	num_assets: UInt64Schema.describe('Number of assets in the allowed_assets array')
})
export type QUtilPollResponse = z.infer<typeof QUtilPollSchema>

export const GetPollInfoResponseSchema = z.object({
	found: UInt64Schema.describe('Whether the poll was found (1) or not (0)'),
	poll_info: QUtilPollSchema.describe('Detailed information about the poll'),
	poll_link: z
		.string()
		.max(256, 'GitHub URL must be 256 characters or less')
		.describe('GitHub URL associated with the poll')
})
export type GetPollInfoResponse = z.infer<typeof GetPollInfoResponseSchema>

// ============================================================================
// FORM SCHEMAS - For user input validation
// ============================================================================

export const CreatePollSchema = z
	.object({
		poll_name: z
			.string()
			.min(1, 'Poll name is required')
			.max(50, 'Poll name must be 50 characters or less')
			.describe('Name of the poll (max 50 characters)'),
		poll_type: z
			.enum(POLL_TYPE, {
				error: 'Please select a valid poll type'
			})
			.describe('Type of poll: Qubic or Asset'),
		min_amount: z
			.number()
			.min(1, 'Minimum amount must be at least 1')
			.max(Number.MAX_SAFE_INTEGER, 'Amount is too large')
			.describe('Minimum amount required to vote'),
		github_link: z
			.url('Please enter a valid URL')
			.startsWith('https://github.com/', 'GitHub link must start with https://github.com/')
			.describe('GitHub repository link for the poll'),
		allowed_assets: z
			.array(AssetSchema)
			.max(
				QUTIL_CONFIG.MAX_ASSETS_PER_POLL,
				`Maximum ${QUTIL_CONFIG.MAX_ASSETS_PER_POLL} assets allowed`
			)
			.optional()
			.describe('List of allowed assets for asset-type polls')
	})
	.refine(
		(data) => {
			// For Qubic polls, no assets should be specified
			if (data.poll_type === POLL_TYPE.QUBIC && (data.allowed_assets?.length ?? 0) > 0) {
				return false
			}
			// For Asset polls, at least one asset must be specified
			if (
				data.poll_type === POLL_TYPE.ASSET &&
				(!data.allowed_assets || data.allowed_assets.length === 0)
			) {
				return false
			}
			return true
		},
		{
			message: 'Asset polls must have at least one asset, Qubic polls should have no assets',
			path: ['allowed_assets']
		}
	)
export type CreatePollFormData = z.infer<typeof CreatePollSchema>

export const VoteSchema = z.object({
	poll_id: z.number().min(0, 'Invalid poll ID').describe('ID of the poll to vote in'),
	address: QubicIdSchema.describe('Voter address'),
	amount: z
		.number()
		.min(1, 'Vote amount must be at least 1')
		.max(Number.MAX_SAFE_INTEGER, 'Amount is too large')
		.describe('Amount to vote with'),
	chosen_option: z
		.number()
		.min(0, 'Option must be at least 0')
		.max(QUTIL_CONFIG.MAX_OPTIONS - 1, `Option must be less than ${QUTIL_CONFIG.MAX_OPTIONS}`)
		.describe(`Voting option (0 to ${QUTIL_CONFIG.MAX_OPTIONS - 1})`)
})
export type VoteFormData = z.infer<typeof VoteSchema>
