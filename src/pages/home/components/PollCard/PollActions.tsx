'use client'

import { Vote } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useWalletConnect } from '@/hooks'
import type { PollWithResults } from '@/types'

interface PollActionsProps {
	poll: PollWithResults
	showCancelButton?: boolean
	onVoteClick: () => void
	onCancelClick?: () => void
}

export default function PollActions({
	poll,
	showCancelButton = false,
	onVoteClick,
	onCancelClick
}: PollActionsProps) {
	const { isWalletConnected, selectedAccount, handleConnectWallet } = useWalletConnect()
	const isOwner = selectedAccount?.address === poll.creator

	const renderCtaButton = () => {
		if (!isWalletConnected) {
			return (
				<Button onClick={handleConnectWallet} className="w-full">
					Connect Wallet to Vote
				</Button>
			)
		}

		return (
			<Button onClick={onVoteClick} disabled={!isWalletConnected} className="w-full">
				<Vote className="mr-2 h-4 w-4" />
				Cast Vote
			</Button>
		)
	}

	return (
		<div className="space-y-3">
			{renderCtaButton()}

			{showCancelButton && isOwner && (
				<Button onClick={onCancelClick} variant="destructive" className="w-full">
					Cancel Poll
				</Button>
			)}
		</div>
	)
}
