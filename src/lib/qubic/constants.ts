/* -----------------------------------
   Constants
----------------------------------- */

import { QubicDefinitions } from '@qubic-lib/qubic-ts-library/dist/QubicDefinitions'

export const QUBIC_ID_SIZE = QubicDefinitions.PUBLIC_KEY_LENGTH // 32 bytes

export const NULL_ID = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

export const QUTIL_CONFIG = {
	CONTRACT_INDEX: 4,
	ADDRESS: 'EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVWRF',

	MAX_OPTIONS: 64,
	MAX_NUM_OF_POLLS: 64, // Maximum number of polls (active + inactive)
	MAX_ASSETS_PER_POLL: 16,
	MAX_VOTERS_PER_POLL: 131_072,
	MAX_VOTERS: 64 * 131_072,
	VOTE_FEE: 100,
	POLL_CREATION_FEE: 10_000_000,
	POLL_GITHUB_URL_MAX_SIZE: 256, // Max string length for poll's GitHub URLs
	POLL_CREATION_EXPECTED_SIZE: 952
} as const

export const QUTIL_FUNCTIONS = {
	GET_SEND_TO_MANY_V1_FEE: 1,
	GET_TOTAL_NUMBER_OF_ASSET_SHARES: 2,
	GET_CURRENT_RESULT: 3,
	GET_POLLS_BY_CREATOR: 4,
	GET_CURRENT_POLL_ID: 5,
	GET_POLL_INFO: 6
} as const

export type QUtilFunctionKey = keyof typeof QUTIL_FUNCTIONS
export type QUtilFunction = (typeof QUTIL_FUNCTIONS)[QUtilFunctionKey]

export const QUTIL_PROCEDURES = {
	SEND_TO_MANY_V1: 1,
	BURN_QUBIC: 2,
	SEND_TO_MANY_BENCHMARK: 3,
	CREATE_POLL: 4,
	VOTE: 5
} as const

export type QUtilProcedureKey = keyof typeof QUTIL_PROCEDURES
export type QUtilProcedure = (typeof QUTIL_PROCEDURES)[QUtilProcedureKey]

export const DEFAULT_CHAR_SIZE = 64
