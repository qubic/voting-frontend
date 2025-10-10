'use client'

import { RefreshCw, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCachedPolls } from '@/hooks'
import { useWalletConnect } from '@/hooks'

import type { PollsListType } from '../types'

import { PollCard } from './PollCard'

const POLLS_LIST_UI_CONFIGS: Record<
	PollsListType,
	{
		title: string
		badgeVariant: 'default' | 'secondary' | 'outline'
		emptyTitle: string
		emptyMessage: string
	}
> = {
	active: {
		title: 'Active Polls',
		badgeVariant: 'default',
		emptyTitle: 'No Active Polls',
		emptyMessage: 'There are currently no active polls. Check back later!'
	},
	inactive: {
		title: 'Previous Polls',
		badgeVariant: 'secondary',
		emptyTitle: 'Previous Polls Coming Soon',
		emptyMessage:
			'For now, you can only view polls from the current epoch. Historical poll data from previous epochs will be available soon.'
	},
	'my-polls': {
		title: 'My Polls',
		badgeVariant: 'outline',
		emptyTitle: 'No Polls Created',
		emptyMessage: "You haven't created any polls yet. Create your first poll to get started!"
	}
} as const

interface PollsListProps {
	type?: PollsListType
}

export default function PollsList({ type = 'active' }: PollsListProps) {
	const { polls, loading, error, refresh } = useCachedPolls()
	const { isWalletConnected, handleConnectWallet, selectedAccount } = useWalletConnect()

	// Filter and prepare data for display
	const activePolls = polls.filter((poll) => poll.is_active === 1)
	const inactivePolls = polls.filter((poll) => poll.is_active === 0)
	const myPolls = polls.filter((poll) => poll.creator === selectedAccount?.address)

	const pollsToShow =
		type === 'active' ? activePolls : 
		type === 'inactive' ? inactivePolls : 
		type === 'my-polls' ? myPolls : polls

	const uiConfig = POLLS_LIST_UI_CONFIGS[type]

	// Render loading state
	if (loading) {
		return (
			<div className="py-8 text-center">
				<RefreshCw className="mx-auto mb-2 size-8 animate-spin" />
				<p>Loading polls...</p>
			</div>
		)
	}

	// Render error state
	if (error) {
		return (
			<Card>
				<CardContent className="py-8 text-center">
					<TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
					<h3 className="mb-2 text-lg font-semibold">Error Loading Polls</h3>
					<p className="text-muted-foreground mb-4">{error}</p>
					<Button onClick={refresh} className="mx-auto">
						Try Again
					</Button>
				</CardContent>
			</Card>
		)
	}

	// Render wallet connection required message for my-polls
	if (type === 'my-polls' && !isWalletConnected) {
		return (
			<Card>
				<CardContent className="py-8 text-center">
					<TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
					<h3 className="mb-2 text-lg font-semibold">
						Connect Wallet to View Your Polls
					</h3>
					<p className="text-muted-foreground mb-4">
						You need to connect your wallet to see the polls you've created.
					</p>
					<Button onClick={handleConnectWallet} className="mx-auto">
						Connect Wallet
					</Button>
				</CardContent>
			</Card>
		)
	}

	// Render empty state
	if (pollsToShow.length === 0) {
		// Special handling for inactive polls since they're not available yet
		if (type === 'inactive') {
			return (
				<Card>
					<CardContent className="py-8 text-center">
						<TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-semibold">Previous Polls Coming Soon</h3>
						<p className="text-muted-foreground">
							For now, you can only view polls from the current epoch. Historical poll
							data from previous epochs will be available soon.
						</p>
					</CardContent>
				</Card>
			)
		}

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

	// Render polls list
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h2 className="text-xl font-semibold">{uiConfig.title}</h2>
					<Badge variant={uiConfig.badgeVariant}>{pollsToShow.length}</Badge>
				</div>
				<Button onClick={refresh} disabled={loading} variant="outline" size="sm">
					<RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
					Refresh
				</Button>
			</div>

			<div className="grid gap-4">
				{pollsToShow.map((poll) => (
					<PollCard key={poll.id} poll={poll} showCancelButton={type === 'my-polls'} />
				))}
			</div>
		</div>
	)
}
