'use client'

import { useEffect, useState } from 'react'
import { Users, Vote } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { QUTIL_CONFIG } from '@/lib/qubic'
import { getPollOptionLabel, getPollAvailableOptions } from '@/lib/qubic/poll-options-config'
import type { PollWithResults } from '@/types'

interface PollResultsProps {
	poll: PollWithResults
}

export default function PollResults({ poll }: PollResultsProps) {
	const [customOptionLabels, setCustomOptionLabels] = useState<Record<number, string> | null>(null)
	const [availableOptions, setAvailableOptions] = useState<number[] | null>(null)

	useEffect(() => {
		async function loadConfig() {
			const labels = await getPollAvailableOptions(poll.id)
			if (labels) {
				setAvailableOptions(labels)
				const labelsMap: Record<number, string> = {}
				for (const option of labels) {
					const label = await getPollOptionLabel(poll.id, option)
					if (label) {
						labelsMap[option] = label
					}
				}
				setCustomOptionLabels(labelsMap)
			}
		}
		loadConfig()
	}, [poll.id])

	const totalVotes = poll.results?.result?.reduce((sum, votes) => sum + votes, 0) || 0
	const totalVoters = poll.results?.voter_count?.reduce((sum, count) => sum + count, 0) || 0

	// Create poll results array from actual data
	// For polls with custom config, only show configured options
	// Otherwise, show options that have votes or is the first 2 options even if they have 0 votes
	const pollResults = Array.from({ length: QUTIL_CONFIG.MAX_OPTIONS }, (_, i) => {
		const votes = poll.results?.result?.[i] || 0
		const voterCount = poll.results?.voter_count?.[i] || 0
		return {
			option: i,
			votes,
			voterCount
		}
	}).filter((result, index) => {
		if (availableOptions) {
			// For polls with custom config, only show configured options
			return availableOptions.includes(result.option)
		}
		// Default behavior: show options with votes or first 2 options
		return result.votes > 0 || index < 2
	})

	// Check if this is a binary poll (only options 0 and 1, no other options have votes)
	const isBinaryPoll = (): boolean => {
		// If poll has custom config, it's not a binary poll
		if (availableOptions) return false
		
		// Must have exactly 2 options shown
		if (pollResults.length !== 2) return false
		
		// Must be options 0 and 1
		const hasOnlyBinaryOptions = pollResults.every(result => result.option === 0 || result.option === 1)
		if (!hasOnlyBinaryOptions) return false
		
		// Check if any other options (2+) have votes
		const hasOtherVotes = poll.results?.result?.some((votes, index) => index >= 2 && votes > 0) || false
		
		return !hasOtherVotes
	}

	// Get the display label for an option
	const getOptionLabel = (option: number): string => {
		// Check for custom label first
		if (customOptionLabels && customOptionLabels[option]) {
			return customOptionLabels[option]
		}
		
		if (isBinaryPoll() && option < 2) {
			return `Option ${option} - ${option === 0 ? 'No' : 'Yes'}`
		}
		return `Option ${option}`
	}

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
								<span className="font-medium">{getOptionLabel(result.option)}</span>
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
