import { RefreshCw, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLatestStats, useQUtilContract } from '@/hooks'

interface PollsOverviewData {
	totalPolls: number
	activePolls: number
}

export default function PollsOverview() {
	const [isLoading, setIsLoading] = useState(false)
	const [overviewData, setOverviewData] = useState<PollsOverviewData>({
		totalPolls: 0,
		activePolls: 0
	})

	const { getCurrentPollId } = useQUtilContract()

	const { latestStats, isLoading: statsLoading, refetch } = useLatestStats()

	const loadPollsOverview = useCallback(async () => {
		setIsLoading(true)
		try {
			const result = await getCurrentPollId()

			if (result.success) {
				const { current_poll_id, active_count } = result.data
				setOverviewData({
					totalPolls: parseInt(current_poll_id, 10),
					activePolls: parseInt(active_count, 10)
				})
			}
		} catch (error) {
			console.error('Failed to load polls overview:', error)
		} finally {
			setIsLoading(false)
		}
	}, [getCurrentPollId])

	const handleRefresh = useCallback(() => {
		loadPollsOverview()
		refetch()
	}, [loadPollsOverview, refetch])

	useEffect(() => {
		loadPollsOverview()
	}, [loadPollsOverview])

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Polls Overview
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isLoading || statsLoading}
					>
						<RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="text-center">
						{isLoading ? (
							<Skeleton className="mx-auto mb-1 h-7 w-16" />
						) : (
							<div className="text-primary text-2xl font-bold">
								{overviewData.activePolls}
							</div>
						)}
						<div className="text-muted-foreground text-sm">Active Polls</div>
					</div>
					<div className="text-center">
						{isLoading ? (
							<Skeleton className="mx-auto mb-1 h-7 w-16" />
						) : (
							<div className="text-2xl font-bold">{overviewData.totalPolls}</div>
						)}
						<div className="text-muted-foreground text-sm">Total Polls</div>
					</div>
					<div className="text-center">
						{statsLoading || isLoading ? (
							<Skeleton className="mx-auto mb-1 h-7 w-16" />
						) : (
							<div className="text-2xl font-bold">{latestStats?.epoch ?? 'N/A'}</div>
						)}
						<div className="text-muted-foreground text-sm">Epoch</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
