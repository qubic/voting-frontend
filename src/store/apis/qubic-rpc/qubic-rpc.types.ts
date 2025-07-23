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

export interface QuerySmartContractArgs {
	contractIndex: number
	inputType: number
	inputSize: number
	requestData: string
}

export interface QuerySmartContractResponse {
	contractIndex: number
	inputType: number
	inputSize: number
	requestData: string
}
