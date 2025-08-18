import type {
	CreatePollFormData,
	GetCurrentResultResponse,
	QUtilPollResponse,
	VoteFormData
} from '@/lib/qubic/schemas'

export type Language = {
	id: string
	label: string
}

export interface TransactionResponse {
	success: boolean
	tick?: string
	txHash?: string
	message?: string
	explorerLink?: string
}

export type PollWithResults = QUtilPollResponse & {
	id: number
	results?: GetCurrentResultResponse
	poll_link: string
}

export type TransactionStatus = 'pending' | 'success' | 'failed'

// Types for transaction monitoring
type BasePendingTransaction = {
	targetTick: number
	txHash: string
	userAddress: string
	status: TransactionStatus
	errorMessage?: string
}

export type PendingTransaction =
	| (BasePendingTransaction & {
			type: 'createPoll'
			data: CreatePollFormData
	  })
	| (BasePendingTransaction & {
			type: 'vote'
			data: VoteFormData
	  })
	| (BasePendingTransaction & {
			type: 'cancelPoll'
			data: {
				poll_id: number
			}
	  })
