import { POLLING_INTERVALS } from '@/constants/polling-intervals'
import { useGetLatestStatsQuery } from '@/store/apis/qubic-rpc/qubic-rpc.api'
import type { GetLatestStatsResponse } from '@/store/apis/qubic-rpc/qubic-rpc.types'

interface UseLatestStatsReturn {
	latestStats: GetLatestStatsResponse['data'] | undefined
	isLoading: boolean
	isFetching: boolean
	error: ReturnType<typeof useGetLatestStatsQuery>['error']
	refetch: ReturnType<typeof useGetLatestStatsQuery>['refetch']
}

export const useLatestStats = (): UseLatestStatsReturn => {
	const { data, isLoading, isFetching, error, refetch } = useGetLatestStatsQuery(undefined, {
		pollingInterval: POLLING_INTERVALS.LATEST_STATS,
		refetchOnMountOrArgChange: true
	})

	return {
		latestStats: data,
		isLoading,
		isFetching,
		error,
		refetch
	}
}
