'use client'

import { Users, Vote } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { QUTIL_CONFIG } from '@/lib/qubic'
import type { PollWithResults } from '@/types'

interface PollResultsProps {
	poll: PollWithResults
}

export default function PollResults({ poll }: PollResultsProps) {
	const totalVotes = poll.results?.result?.reduce((sum, votes) => sum + votes, 0) || 0
	const totalVoters = poll.results?.voter_count?.reduce((sum, count) => sum + count, 0) || 0

	// Create poll results array from actual data
	// We only show options that has votes or is the first 2 options even if they have 0 votes
	const pollResults = Array.from({ length: QUTIL_CONFIG.MAX_OPTIONS }, (_, i) => {
		const votes = poll.results?.result?.[i] || 0
		const voterCount = poll.results?.voter_count?.[i] || 0
		return {
			option: i,
			votes,
			voterCount
		}
	}).filter((result, index) => result.votes > 0 || index < 2)

	return (
		<div className="space-y-4">
			{/* Poll statistics */}
			<div className="text-muted-foreground flex items-center justify-between text-sm">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1">
						<Vote className="h-4 w-4" />
						{totalVotes.toLocaleString()} votes
					</div>
					<div className="flex items-center gap-1">
						<Users className="h-4 w-4" />
						{totalVoters} voters
					</div>
				</div>
			</div>

			{/* Voting results */}
			<div className="space-y-3">
				{pollResults.map((result) => {
					const percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
					return (
						<div key={result.option} className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="font-medium">Option {result.option}</span>
								<div className="text-muted-foreground flex items-center gap-4">
									<span>
										{result.votes.toLocaleString()} votes ({result.voterCount}{' '}
										voters)
									</span>
									<span className="font-medium">{percentage.toFixed(1)}%</span>
								</div>
							</div>
							<Progress value={percentage} className="h-2" />
						</div>
					)
				})}
			</div>
		</div>
	)
}
