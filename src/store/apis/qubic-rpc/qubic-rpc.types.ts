export interface GetLatestStatsResponse {
	data: {
		timestamp: string
		circulatingSupply: string
		activeAddresses: number
		price: number
		marketCap: string
		epoch: number
		currentTick: number
		ticksInCurrentEpoch: number
		emptyTicksInCurrentEpoch: number
		epochTickQuality: number
		burnedQus: string
	}
}

export interface BroadcastTransactionArgs {
	encodedTransaction: string
}

export interface BroadcastTransactionResponse {
	contractIndex: number
	encodedTransaction: string
	transactionId: string
}

export interface QuerySmartContractArgs {
	contractIndex: number
	inputType: number
	inputSize: number
	requestData: string
}

export interface QuerySmartContractResponse {
	peersBroadcasted: number
	inputType: number
	inputSize: number
	responseData: string
}

export interface GetTransactionResponse {
	transaction: {
		txId: string
		sourceId: string
		destId: string
		amount: string
		tickNumber: number
		inputType: number
		inputSize: number
		inputHex: string
		signatureHex: string
	}
	timestamp: string
	moneyFlew: boolean
}

export interface TickInfo {
	tick: number
	duration: number
	epoch: number
	initialTick: number
}

export interface GetTickInfoResponse {
	tickInfo: TickInfo
}
