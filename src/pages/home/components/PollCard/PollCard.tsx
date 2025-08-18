'use client'

import { useState } from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAppDispatch } from '@/hooks'
import { ModalType, showModal } from '@/store/slices/modal.slice'
import type { PollWithResults } from '@/types'

import PollActions from './PollActions'
import PollMetadata from './PollMetadata'
import PollResults from './PollResults'
import VoteForm from './VoteForm'
import VotingInfo from './VotingInfo'

interface PollCardProps {
	poll: PollWithResults
	showCancelButton?: boolean
}

export default function PollCard({ poll, showCancelButton = false }: PollCardProps) {
	const dispatch = useAppDispatch()
	const [showVoteForm, setShowVoteForm] = useState(false)

	const isActive = Boolean(poll.is_active)

	const handleCancelPollClick = () => {
		dispatch(
			showModal({
				modalType: ModalType.CANCEL_POLL_CONFIRMATION,
				modalProps: {
					pollId: poll.id.toString(),
					pollName: poll.poll_name
				}
			})
		)
	}

	return (
		<Card>
			<CardHeader>
				<PollMetadata poll={poll} />
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Poll results */}
				<PollResults poll={poll} />

				{/* Active poll actions */}
				{isActive && (
					<div className="space-y-4 border-t pt-4">
						{/* Voting information */}
						<VotingInfo />

						{!showVoteForm ? (
							<PollActions
								poll={poll}
								showCancelButton={showCancelButton}
								onVoteClick={() => setShowVoteForm(true)}
								onCancelClick={handleCancelPollClick}
							/>
						) : (
							<VoteForm poll={poll} onCancel={() => setShowVoteForm(false)} />
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
