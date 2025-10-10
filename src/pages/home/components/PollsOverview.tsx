import { RefreshCw, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCachedPolls, useLatestStats } from '@/hooks'

interface PollsOverviewData {
	totalPolls: number
	activePolls: number
}

export default function PollsOverview() {
	const { polls, loading: pollsLoading, lastUpdated } = useCachedPolls()
	const { latestStats, isLoading: statsLoading, refetch } = useLatestStats()

	// Calculate overview data from cached polls
	const overviewData = useMemo(() => {
		const activePolls = polls.filter((poll) => poll.is_active === 1)
		return {
			totalPolls: polls.length,
			activePolls: activePolls.length
		}
	}, [polls])

	const isLoading = pollsLoading || statsLoading

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{/* Polls Overview */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Polls Overview</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => window.location.reload()}
						disabled={isLoading}
					>
						<RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-4 w-[100px]" />
							<Skeleton className="h-4 w-[80px]" />
						</div>
					) : (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Total Polls</span>
								<span className="text-2xl font-bold">{overviewData.totalPolls}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Active Polls</span>
								<span className="text-2xl font-bold text-green-600">{overviewData.activePolls}</span>
							</div>
							{lastUpdated && (
								<div className="text-xs text-muted-foreground">
									Last updated: {new Date(lastUpdated).toLocaleString()}
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Latest Stats */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Latest Stats</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						disabled={statsLoading}
					>
						<TrendingUp className={`mr-2 h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
				</CardHeader>
				<CardContent>
					{statsLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-4 w-[100px]" />
							<Skeleton className="h-4 w-[80px]" />
						</div>
					) : latestStats ? (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Current Tick</span>
								<span className="text-2xl font-bold">{latestStats.currentTick?.toLocaleString()}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Epoch</span>
								<span className="text-2xl font-bold">{latestStats.currentEpoch}</span>
							</div>
						</div>
					) : (
						<div className="text-sm text-muted-foreground">No stats available</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}