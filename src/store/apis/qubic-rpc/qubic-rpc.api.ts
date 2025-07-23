import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { envConfig } from '@/configs'

import type {
	GetLatestStatsResponse,
	QuerySmartContractArgs,
	QuerySmartContractResponse
} from './qubic-rpc.types'

const BASE_URL = `${envConfig.QUBIC_RPC_URL}/v1`

export const qubicRpcApi = createApi({
	reducerPath: 'qubicRpcApi',
	baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
	endpoints: (build) => ({
		getLatestStats: build.query<GetLatestStatsResponse['data'], void>({
			query: () => '/latest-stats',
			transformResponse: (response: GetLatestStatsResponse) => response.data
		}),
		querySmartContract: build.mutation<QuerySmartContractResponse, QuerySmartContractArgs>({
			query: (payload) => ({
				url: '/querySmartContract',
				method: 'POST',
				body: payload
			})
		})
	})
})

export const { useGetLatestStatsQuery, useQuerySmartContractMutation } = qubicRpcApi
