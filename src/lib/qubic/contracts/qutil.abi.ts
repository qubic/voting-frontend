import { type QUtilFunction, type QUtilProcedure } from '@/lib/qubic/constants'

export type QUtilParamType =
	| 'uint8'
	| 'uint16'
	| 'uint32'
	| 'uint64'
	| 'int8'
	| 'sint8'
	| 'int16'
	| 'sint16'
	| 'int32'
	| 'sint32'
	| 'int64'
	| 'sint64'
	| 'bool'
	| 'bit'
	| 'id'
	| 'char[256]'
	| 'uint8[256]'
	| 'uint64[64]'
	| 'Asset'
	| 'Asset[16]'
	| 'QUtilPoll'

export type QUtilSemanticType = 'address' | 'text'

export type QUtilInputOutput = {
	name: string
	type: QUtilParamType
	semantic?: QUtilSemanticType // For 'id' types, indicates if it's a Qubic address or readable text
}

export interface ContractFunctionMetadata {
	index: QUtilFunction | QUtilProcedure
	name: string
	inputs: QUtilInputOutput[]
	outputs: QUtilInputOutput[]
}

// Enhanced struct field type with semantic information
export type QUtilStructField = {
	name: string
	type: QUtilParamType
	semantic?: QUtilSemanticType
	description?: string // Optional description for documentation
}

// Extended ABI interface that includes struct definitions
export interface QUtilABI {
	functions: Record<string, ContractFunctionMetadata>
	structs: Record<string, QUtilStructField[]>
}

/**
 * Single ABI with every public entry point (functions + procedures) AND struct definitions.
 * Indices match REGISTER_USER_FUNCTIONS_AND_PROCEDURES().
 */
export const QUTIL_ABI: QUtilABI = {
	structs: {
		Asset: [
			{
				name: 'issuer',
				type: 'id',
				semantic: 'address',
				description: 'Qubic address of asset issuer'
			},
			{
				name: 'assetName',
				type: 'uint64',
				description: 'Asset name as uint64'
			}
		],
		QUtilPoll: [
			{
				name: 'poll_name',
				type: 'id',
				semantic: 'text',
				description: 'Human-readable poll name'
			},
			{ name: 'poll_type', type: 'uint64', description: 'Type identifier for the poll' },
			{ name: 'min_amount', type: 'uint64', description: 'Minimum amount required to vote' },
			{
				name: 'is_active',
				type: 'uint64',
				description: 'Whether the poll is currently active'
			},
			{
				name: 'creator',
				type: 'id',
				semantic: 'address',
				description: 'Qubic address of poll creator'
			},
			{
				name: 'allowed_assets',
				type: 'Asset[16]',
				description: 'Array of allowed voting assets'
			},
			{
				name: 'num_assets',
				type: 'uint64',
				description: 'Number of assets in the allowed_assets array'
			}
		]
	},

	functions: {
		// FUNCTIONS (view/pure)
		getSendToManyV1Fee: {
			index: 1,
			name: 'getSendToManyV1Fee',
			inputs: [],
			outputs: [{ name: 'fee', type: 'sint64' }]
		},
		getTotalNumberOfAssetShares: {
			index: 2,
			name: 'getTotalNumberOfAssetShares',
			inputs: [{ name: 'asset', type: 'Asset' }],
			outputs: [{ name: 'balance', type: 'sint64' }]
		},
		getCurrentResult: {
			index: 3,
			name: 'getCurrentResult',
			inputs: [{ name: 'poll_id', type: 'uint64' }],
			outputs: [
				{ name: 'result', type: 'uint64[64]' },
				{ name: 'voter_count', type: 'uint64[64]' },
				{ name: 'is_active', type: 'uint64' }
			]
		},
		getPollsByCreator: {
			index: 4,
			name: 'getPollsByCreator',
			inputs: [{ name: 'creator', type: 'id', semantic: 'address' }],
			outputs: [
				{ name: 'poll_ids', type: 'uint64[64]' },
				{ name: 'count', type: 'uint64' }
			]
		},
		getCurrentPollId: {
			index: 5,
			name: 'getCurrentPollId',
			inputs: [],
			outputs: [
				{ name: 'current_poll_id', type: 'uint64' },
				{ name: 'active_poll_ids', type: 'uint64[64]' },
				{ name: 'active_count', type: 'uint64' }
			]
		},
		getPollInfo: {
			index: 6,
			name: 'getPollInfo',
			inputs: [{ name: 'poll_id', type: 'uint64' }],
			outputs: [
				{ name: 'found', type: 'uint64' },
				{ name: 'poll_info', type: 'QUtilPoll' },
				{ name: 'poll_link', type: 'uint8[256]' }
			]
		},

		// PROCEDURES (state-changing)
		sendToManyV1: {
			index: 1,
			name: 'sendToManyV1',
			inputs: [
				{ name: 'dst0', type: 'id', semantic: 'address' },
				{ name: 'dst1', type: 'id', semantic: 'address' },
				{ name: 'dst2', type: 'id', semantic: 'address' },
				{ name: 'dst3', type: 'id', semantic: 'address' },
				{ name: 'dst4', type: 'id', semantic: 'address' },
				{ name: 'dst5', type: 'id', semantic: 'address' },
				{ name: 'dst6', type: 'id', semantic: 'address' },
				{ name: 'dst7', type: 'id', semantic: 'address' },
				{ name: 'dst8', type: 'id', semantic: 'address' },
				{ name: 'dst9', type: 'id', semantic: 'address' },
				{ name: 'dst10', type: 'id', semantic: 'address' },
				{ name: 'dst11', type: 'id', semantic: 'address' },
				{ name: 'dst12', type: 'id', semantic: 'address' },
				{ name: 'dst13', type: 'id', semantic: 'address' },
				{ name: 'dst14', type: 'id', semantic: 'address' },
				{ name: 'dst15', type: 'id', semantic: 'address' },
				{ name: 'dst16', type: 'id', semantic: 'address' },
				{ name: 'dst17', type: 'id', semantic: 'address' },
				{ name: 'dst18', type: 'id', semantic: 'address' },
				{ name: 'dst19', type: 'id', semantic: 'address' },
				{ name: 'dst20', type: 'id', semantic: 'address' },
				{ name: 'dst21', type: 'id', semantic: 'address' },
				{ name: 'dst22', type: 'id', semantic: 'address' },
				{ name: 'dst23', type: 'id', semantic: 'address' },
				{ name: 'dst24', type: 'id', semantic: 'address' },
				{ name: 'amt0', type: 'sint64' },
				{ name: 'amt1', type: 'sint64' },
				{ name: 'amt2', type: 'sint64' },
				{ name: 'amt3', type: 'sint64' },
				{ name: 'amt4', type: 'sint64' },
				{ name: 'amt5', type: 'sint64' },
				{ name: 'amt6', type: 'sint64' },
				{ name: 'amt7', type: 'sint64' },
				{ name: 'amt8', type: 'sint64' },
				{ name: 'amt9', type: 'sint64' },
				{ name: 'amt10', type: 'sint64' },
				{ name: 'amt11', type: 'sint64' },
				{ name: 'amt12', type: 'sint64' },
				{ name: 'amt13', type: 'sint64' },
				{ name: 'amt14', type: 'sint64' },
				{ name: 'amt15', type: 'sint64' },
				{ name: 'amt16', type: 'sint64' },
				{ name: 'amt17', type: 'sint64' },
				{ name: 'amt18', type: 'sint64' },
				{ name: 'amt19', type: 'sint64' },
				{ name: 'amt20', type: 'sint64' },
				{ name: 'amt21', type: 'sint64' },
				{ name: 'amt22', type: 'sint64' },
				{ name: 'amt23', type: 'sint64' },
				{ name: 'amt24', type: 'sint64' }
			],
			outputs: [{ name: 'returnCode', type: 'sint32' }]
		},
		burnQubic: {
			index: 2,
			name: 'burnQubic',
			inputs: [{ name: 'amount', type: 'sint64' }],
			outputs: [{ name: 'amount', type: 'sint64' }]
		},
		sendToManyBenchmark: {
			index: 3,
			name: 'sendToManyBenchmark',
			inputs: [
				{ name: 'dstCount', type: 'sint64' },
				{ name: 'numTransfersEach', type: 'sint64' }
			],
			outputs: [
				{ name: 'dstCount', type: 'sint64' },
				{ name: 'returnCode', type: 'sint32' },
				{ name: 'total', type: 'sint64' }
			]
		},
		createPoll: {
			index: 4,
			name: 'createPoll',
			inputs: [
				{ name: 'poll_name', type: 'id', semantic: 'text' },
				{ name: 'poll_type', type: 'uint64' },
				{ name: 'min_amount', type: 'uint64' },
				{ name: 'github_link', type: 'uint8[256]' },
				{ name: 'allowed_assets', type: 'Asset[16]' },
				{ name: 'num_assets', type: 'uint64' }
			],
			outputs: [{ name: 'poll_id', type: 'uint64' }]
		},
		vote: {
			index: 5,
			name: 'vote',
			inputs: [
				{ name: 'poll_id', type: 'uint64' },
				{ name: 'address', type: 'id', semantic: 'address' },
				{ name: 'amount', type: 'uint64' },
				{ name: 'chosen_option', type: 'uint64' }
			],
			outputs: [{ name: 'success', type: 'bit' }]
		},
		cancelPoll: {
			index: 6,
			name: 'cancelPoll',
			inputs: [{ name: 'poll_id', type: 'uint64' }],
			outputs: [{ name: 'success', type: 'bit' }]
		}
	}
} as const

// Helper function to resolve any type from the ABI
export const resolveType = (typeName: string): QUtilStructField[] | undefined => {
	return QUTIL_ABI.structs[typeName as keyof typeof QUTIL_ABI.structs]
}

// Helper function to check if a type is a struct
export const isStructType = (typeName: string): boolean => {
	return typeName in QUTIL_ABI.structs
}
