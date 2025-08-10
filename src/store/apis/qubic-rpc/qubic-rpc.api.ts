import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { envConfig } from '@/configs'

import type {
	BroadcastTransactionArgs,
	BroadcastTransactionResponse,
	GetLatestStatsResponse,
	GetTickInfoResponse,
	GetTransactionResponse,
	QuerySmartContractArgs,
	QuerySmartContractResponse
} from './qubic-rpc.types'

const BASE_URL = `${envConfig.QUBIC_RPC_URL}`

export const qubicRpcApi = createApi({
	reducerPath: 'qubicRpcApi',
	baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
	endpoints: (build) => ({
		// V1 Endpoints
		getLatestStats: build.query<GetLatestStatsResponse['data'], void>({
			query: () => '/v1/latest-stats',
			transformResponse: (response: GetLatestStatsResponse) => response.data
		}),
		getTickInfo: build.query<GetTickInfoResponse['tickInfo'], void>({
			query: () => '/v1/tick-info',
			transformResponse: (response: GetTickInfoResponse) => response.tickInfo
		}),
		broadcastTransaction: build.mutation<
			BroadcastTransactionResponse,
			BroadcastTransactionArgs
		>({
			query: (payload) => ({
				url: '/v1/broadcast-transaction',
				method: 'POST',
				body: payload
			})
		}),
		querySmartContract: build.mutation<QuerySmartContractResponse, QuerySmartContractArgs>({
			query: (payload) => ({
				url: '/v1/querySmartContract',
				method: 'POST',
				body: payload
			})
		}),
		// V2
		getTransaction: build.query<GetTransactionResponse, string>({
			query: (txId) => `/v2/transactions/${txId}`
		})
	})
})

export const {
	// V1 Endpoints
	useGetLatestStatsQuery,
	useGetTickInfoQuery,
	useLazyGetTickInfoQuery,
	useBroadcastTransactionMutation,
	useQuerySmartContractMutation,
	// V2 Endpoints
	useGetTransactionQuery
} = qubicRpcApi
