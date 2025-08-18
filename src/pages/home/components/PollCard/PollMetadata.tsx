'use client'

import { SquareArrowOutUpRightIcon, UserIcon } from 'lucide-react'

import { ExplorerLink } from '@/components/links'
import { ExplorerLinkType } from '@/components/links/ExplorerLink'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardAction, CardTitle } from '@/components/ui/card'
import { NULL_ID, POLL_TYPE } from '@/lib/qubic'
import type { PollWithResults } from '@/types'

interface PollMetadataProps {
	poll: PollWithResults
}

export default function PollMetadata({ poll }: PollMetadataProps) {
	const isQubicPollType = poll.poll_type === POLL_TYPE.QUBIC
	const pollAllowedAssets = poll.allowed_assets.filter(
		(asset) => asset.issuer !== NULL_ID && asset.assetName !== 'N/A'
	)

	return (
		<>
			<CardTitle className="text-lg">{poll.poll_name}</CardTitle>

			{/* Creator information */}
			<div className="flex items-center gap-2 text-sm">
				<UserIcon className="text-muted-foreground h-4 w-4" />
				<span className="text-muted-foreground">Created by:</span>
				<ExplorerLink
					value={poll.creator}
					type={ExplorerLinkType.ADDRESS}
					ellipsis
					showTooltip
				/>
			</div>

			{poll.poll_link && (
				<Tooltip>
					<TooltipTrigger asChild>
						<CardAction>
							<Button variant="ghost" size="icon" asChild>
								<a href={poll.poll_link} target="_blank" rel="noopener noreferrer">
									<SquareArrowOutUpRightIcon />
								</a>
							</Button>
						</CardAction>
					</TooltipTrigger>
					<TooltipContent>
						<p>View poll details</p>
					</TooltipContent>
				</Tooltip>
			)}

			{/* Poll type, minimum amount, and assets grouped together */}
			<div className="space-y-2">
				<div className="text-muted-foreground flex items-center gap-2 text-sm">
					<Badge variant="outline">{isQubicPollType ? 'Qubic' : 'Asset'}</Badge>
					<span>
						Min: {poll.min_amount.toLocaleString()} {isQubicPollType ? 'QU' : 'Assets'}
					</span>
				</div>

				{/* Allowed assets for asset polls */}
				{!isQubicPollType && pollAllowedAssets.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{pollAllowedAssets.slice(0, 3).map((asset, index) => (
							<Badge key={index} variant="secondary" className="text-xs">
								{asset.assetName}
							</Badge>
						))}
						{pollAllowedAssets.length > 3 && (
							<Badge variant="secondary" className="text-xs">
								+{pollAllowedAssets.length - 3} more
							</Badge>
						)}
					</div>
				)}
			</div>
		</>
	)
}
