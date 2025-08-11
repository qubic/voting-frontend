import type { GetCurrentResultResponse, QUtilPollResponse } from '@/lib/qubic/schemas'

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
