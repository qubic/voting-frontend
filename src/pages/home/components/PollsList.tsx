'use client'

import { RefreshCw, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useQUtilContract } from '@/hooks'
import type { GetCurrentResultResponse, GetPollInfoResponse } from '@/lib/qubic/schemas'
import type { ContractResponse } from '@/lib/qubic/types'
import type { PollWithResults } from '@/types'

import PollCard from './PollCard'

interface PollsListProps {
	type?: 'active' | 'inactive'
}

// Helper function to fetch poll info and results
async function fetchPollWithResults(
	pollId: number,
	getPollInfo: (id: number) => Promise<ContractResponse<GetPollInfoResponse>>,
	getCurrentResult: (id: number) => Promise<ContractResponse<GetCurrentResultResponse>>
): Promise<PollWithResults | null> {
	try {
		const pollInfo = await getPollInfo(pollId)
		if (!pollInfo.success || !pollInfo.data || pollInfo.data.found !== 1) {
			return null
		}

		const poll: PollWithResults = {
			...pollInfo.data.poll_info,
			id: pollId,
			poll_link: pollInfo.data.poll_link
		}

		// Fetch poll results
		const pollResults = await getCurrentResult(pollId)
		if (pollResults.success && pollResults.data) {
			poll.results = pollResults.data
		}

		return poll
	} catch (error) {
		console.error(`Failed to fetch poll ${pollId}:`, error)
		return null
	}
}

// Helper function to fetch active polls
async function fetchActivePolls(
	activePollIds: number[],
	activeCount: number,
	getPollInfo: (id: number) => Promise<ContractResponse<GetPollInfoResponse>>,
	getCurrentResult: (id: number) => Promise<ContractResponse<GetCurrentResultResponse>>
): Promise<PollWithResults[]> {
	const activePolls: PollWithResults[] = []

	for (let i = 0; i < activeCount; i++) {
		const pollId = activePollIds[i]
		const poll = await fetchPollWithResults(pollId, getPollInfo, getCurrentResult)
		if (poll) {
			activePolls.push(poll)
		}
	}

	return activePolls
}

// Helper function to fetch recent inactive polls
async function fetchInactivePolls(
	currentPollId: number,
	activePollIds: number[],
	maxToShow: number,
	getPollInfo: (id: number) => Promise<ContractResponse<GetPollInfoResponse>>,
	getCurrentResult: (id: number) => Promise<ContractResponse<GetCurrentResultResponse>>
): Promise<PollWithResults[]> {
	const inactivePolls: PollWithResults[] = []
	const totalPolls = currentPollId

	for (let i = Math.max(0, totalPolls - maxToShow - 1); i < totalPolls; i++) {
		// Skip if this poll is already in active polls
		if (activePollIds.includes(i)) continue

		const poll = await fetchPollWithResults(i, getPollInfo, getCurrentResult)
		if (poll) {
			inactivePolls.push(poll)
		}
	}

	return inactivePolls
}

export default function PollsList({ type = 'active' }: PollsListProps) {
	const [polls, setPolls] = useState<PollWithResults[]>([])
	const [loading, setLoading] = useState(false)

	const { getCurrentPollId, getPollInfo, getCurrentResult } = useQUtilContract()

	const loadPolls = useCallback(async () => {
		setLoading(true)
		try {
			const currentPollData = await getCurrentPollId()

			if (currentPollData.success && currentPollData.data) {
				const { current_poll_id, active_poll_ids, active_count } = currentPollData.data

				// Fetch active and inactive polls using helper functions
				const [activePolls, inactivePolls] = await Promise.all([
					fetchActivePolls(active_poll_ids, active_count, getPollInfo, getCurrentResult),
					fetchInactivePolls(
						current_poll_id,
						active_poll_ids,
						5,
						getPollInfo,
						getCurrentResult
					)
				])

				setPolls([...activePolls, ...inactivePolls])
			}
		} catch (error) {
			console.error('Failed to load polls:', error)
		} finally {
			setLoading(false)
		}
	}, [getCurrentPollId, getPollInfo, getCurrentResult])

	useEffect(() => {
		loadPolls()
	}, [loadPolls])

	// Filter and prepare data for display
	const activePolls = polls.filter((poll) => poll.is_active === 1)
	const inactivePolls = polls.filter((poll) => poll.is_active === 0)
	const pollsToShow = type === 'active' ? activePolls : inactivePolls

	// UI configuration based on active/inactive state
	const uiConfig = {
		title: type === 'active' ? 'Active Polls' : 'Previous Polls',
		badgeVariant: type === 'active' ? ('default' as const) : ('secondary' as const),
		emptyTitle: type === 'active' ? 'No Active Polls' : 'No Previous Polls',
		emptyMessage:
			type === 'active'
				? 'There are currently no active polls. Check back later!'
				: 'No previous polls found.'
	}

	// Render loading state
	if (loading) {
		return (
			<div className="py-8 text-center">
				<RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin" />
				<p>Loading polls...</p>
			</div>
		)
	}

	// Render polls list
	if (pollsToShow.length > 0) {
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<h2 className="text-xl font-semibold">{uiConfig.title}</h2>
					<Badge variant={uiConfig.badgeVariant}>{pollsToShow.length}</Badge>
				</div>
				<div className="grid gap-4">
					{pollsToShow.map((poll) => (
						<PollCard
							key={poll.id}
							poll={poll}
							onVoteSuccess={type === 'active' ? loadPolls : undefined}
						/>
					))}
				</div>
			</div>
		)
	}

	// Render empty state
	return (
		<Card>
			<CardContent className="py-8 text-center">
				<TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
				<h3 className="mb-2 text-lg font-semibold">{uiConfig.emptyTitle}</h3>
				<p className="text-muted-foreground">{uiConfig.emptyMessage}</p>
			</CardContent>
		</Card>
	)
}
