import type {
	AssetSchema,
	BooleanNumSchema,
	Int64Schema,
	QubicIdSchema,
	UInt64Schema
} from './schemas'

export type FieldType = 'Array' | string // This will be constrained by QUtilParamType when used

export interface InputField {
	name: string
	type: FieldType
	size?: string
	elementType?: string
	semantic?: 'address' | 'text'
}

export interface EncodeParams {
	[key: string]: unknown
}

export const POLL_TYPE = {
	QUBIC: 1,
	ASSET: 2
} as const
export type POLL_TYPE = (typeof POLL_TYPE)[keyof typeof POLL_TYPE]

export interface Poll {
	poll_name: string
	poll_type: POLL_TYPE
	min_amount: UInt64Schema
	is_active: UInt64Schema
	creator: QubicIdSchema
	allowed_assets: AssetSchema[]
	num_assets: UInt64Schema
}

// --- Function output shapes ---
export interface GetSendToManyV1FeeOutput {
	fee: Int64Schema // equals 10 per contract
}

export interface GetTotalNumberOfAssetSharesOutput {
	shares: Int64Schema // function returns a sint64
}

export interface GetCurrentResultOutput {
	result: UInt64Schema[] // length 64
	voter_count: UInt64Schema[] // length 64
	is_active: UInt64Schema // 0 or 1
}

export interface GetPollsByCreatorOutput {
	poll_ids: UInt64Schema[] // length 64, first `count` items are meaningful
	count: UInt64Schema
}

export interface GetCurrentPollIdOutput {
	current_poll_id: UInt64Schema
	active_poll_ids: UInt64Schema[] // length 64, first `active_count` items meaningful
	active_count: UInt64Schema
}

export interface GetPollInfoOutput {
	found: BooleanNumSchema
	poll_info: Poll
	poll_link: number[] // uint8[256] (raw bytes)
}

// QPI::Asset (implied by other snippets): 32-byte issuer + 64-bit assetName
export interface Asset {
	issuer: QubicIdSchema // 32 bytes, encoded as string
	assetName: bigint // uint64
}

export interface QUtilPoll {
	poll_name: string // id
	poll_type: 1 | 2 // QUTIL_POLL_TYPE_QUBIC | QUTIL_POLL_TYPE_ASSET
	min_amount: UInt64Schema // uint64
	is_active: UInt64Schema // uint64 used as flag (0/1)
	creator: QubicIdSchema // id
	allowed_assets: AssetSchema[] // up to 16
	num_assets: UInt64Schema // uint64
}

export interface QUtilVoter {
	address: QubicIdSchema // id
	amount: UInt64Schema // uint64
	chosen_option: UInt64Schema // uint64 (0..63)
}

/** ---------- Public function/procedure IO types ---------- **/

// GetSendToManyV1Fee
export interface GetSendToManyV1Fee_output {
	fee: Int64Schema // sint64 -> number
}

// SendToManyV1
export interface SendToManyV1_input {
	dst0: QubicIdSchema
	dst1: QubicIdSchema
	dst2: QubicIdSchema
	dst3: QubicIdSchema
	dst4: QubicIdSchema
	dst5: QubicIdSchema
	dst6: QubicIdSchema
	dst7: QubicIdSchema
	dst8: QubicIdSchema
	dst9: QubicIdSchema
	dst10: QubicIdSchema
	dst11: QubicIdSchema
	dst12: QubicIdSchema
	dst13: QubicIdSchema
	dst14: QubicIdSchema
	dst15: QubicIdSchema
	dst16: QubicIdSchema
	dst17: QubicIdSchema
	dst18: QubicIdSchema
	dst19: QubicIdSchema
	dst20: QubicIdSchema
	dst21: QubicIdSchema
	dst22: QubicIdSchema
	dst23: QubicIdSchema
	dst24: QubicIdSchema

	amt0: bigint
	amt1: bigint
	amt2: bigint
	amt3: bigint
	amt4: bigint
	amt5: bigint
	amt6: bigint
	amt7: bigint
	amt8: bigint
	amt9: bigint
	amt10: bigint
	amt11: bigint
	amt12: bigint
	amt13: bigint
	amt14: bigint
	amt15: bigint
	amt16: bigint
	amt17: bigint
	amt18: bigint
	amt19: bigint
	amt20: bigint
	amt21: bigint
	amt22: bigint
	amt23: bigint
	amt24: bigint
}
export interface SendToManyV1_output {
	returnCode: number // sint32
}

// GetTotalNumberOfAssetShares
export type GetTotalNumberOfAssetShares_input = Asset
export type GetTotalNumberOfAssetShares_output = bigint // sint64

// SendToManyBenchmark
export interface SendToManyBenchmark_input {
	dstCount: bigint // sint64
	numTransfersEach: bigint // sint64
}
export interface SendToManyBenchmark_output {
	dstCount: bigint // sint64 (echo)
	returnCode: number // sint32
	total: bigint // sint64
}

// BurnQubic
export interface BurnQubic_input {
	amount: bigint // sint64
}
export interface BurnQubic_output {
	amount: bigint // sint64
}

// CreatePoll
export interface CreatePoll_input {
	poll_name: string // id
	poll_type: 1 | 2
	min_amount: UInt64Schema // uint64
	github_link: number[] // bytes (uint8[])
	allowed_assets: Asset[] // up to QUTIL_CONFIG.MAX_ASSETS_PER_POLL
	num_assets: UInt64Schema // uint64
}
export interface CreatePoll_output {
	poll_id: UInt64Schema // uint64
}

// Vote
export interface Vote_input {
	poll_id: UInt64Schema // uint64
	address: QubicIdSchema // id
	amount: UInt64Schema // uint64
	chosen_option: UInt64Schema // uint64 (0..63)
}
export interface Vote_output {
	success: boolean // bit
}

// CancelPoll
export interface CancelPoll_input {
	poll_id: UInt64Schema // uint64
}
export interface CancelPoll_output {
	success: boolean // bit
}

// GetCurrentResult
export interface GetCurrentResult_input {
	poll_id: UInt64Schema // uint64
}
export interface GetCurrentResult_output {
	result: UInt64Schema[] // uint64 per option, length QUTIL_CONFIG.MAX_OPTIONS
	voter_count: UInt64Schema[] // uint64 per option, length QUTIL_CONFIG.MAX_OPTIONS
	is_active: UInt64Schema // uint64 (0/1)
}

// GetPollsByCreator
export interface GetPollsByCreator_input {
	creator: QubicIdSchema // id
}
export interface GetPollsByCreator_output {
	poll_ids: UInt64Schema[] // uint64[], length 64, first `count` items meaningful
	count: UInt64Schema // uint64
}

// GetCurrentPollId
export type GetCurrentPollId_input = Record<string, never> // none
export interface GetCurrentPollId_output {
	current_poll_id: UInt64Schema // uint64 (monotonic)
	active_poll_ids: UInt64Schema[] // uint64[], length 64, first `active_count` items meaningful
	active_count: UInt64Schema // uint64
}

// GetPollInfo
export interface GetPollInfo_input {
	poll_id: bigint // uint64
}
export interface GetPollInfo_output {
	found: UInt64Schema // uint64 used as flag (0/1)
	poll_info: QUtilPoll
	poll_link: number[] // bytes, length QUTIL_CONFIG.POLL_GITHUB_URL_MAX_SIZE
}

export interface ContractSuccessResponse<T> {
	success: true
	data: T
	error: null
}

export interface ContractErrorResponse {
	success: false
	data: null
	error: string
}

export type ContractResponse<T> = ContractSuccessResponse<T> | ContractErrorResponse
