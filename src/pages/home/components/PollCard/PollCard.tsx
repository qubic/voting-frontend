'use client'

import { useEffect, useState } from 'react'

import { CopyButton } from '@/components/buttons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAppDispatch, useQUtilContract } from '@/hooks'
import { QUTIL_CONFIG } from '@/lib/qubic'
import { getPollOptionLabels } from '@/lib/qubic/poll-options-config'
import { useQuerySmartContractMutation } from '@/store/apis/qubic-rpc'
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
	const [showTransferVote, setShowTransferVote] = useState(false)

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
						<Button
							variant="outline"
							className="w-full"
							aria-expanded={showTransferVote}
							onClick={() => setShowTransferVote(!showTransferVote)}
						>
							Vote by transfer — no wallet connection
						</Button>
						{showTransferVote && <TransferVoteInstructions key={poll.id} poll={poll} />}
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

function TransferVoteInstructions({ poll }: { poll: PollWithResults }) {
	const { getPollInfo } = useQUtilContract()
	const [querySmartContract] = useQuerySmartContractMutation()
	const [amounts, setAmounts] = useState<number[] | null>(null)
	const [labels, setLabels] = useState<Record<number, string> | null>(null)
	const [error, setError] = useState(false)
	const [refresh, setRefresh] = useState(0)

	useEffect(() => {
		let cancelled = false
		let timer: ReturnType<typeof setTimeout>
		async function load() {
			setAmounts(null)
			setError(false)
			try {
				const [fees, currentPoll, optionLabels] = await Promise.all([
					querySmartContract({
						contractIndex: QUTIL_CONFIG.CONTRACT_INDEX,
						inputType: 7,
						inputSize: 0,
						requestData: ''
					}).unwrap(),
					getPollInfo(poll.id),
					getPollOptionLabels(poll.id)
				])
				if (cancelled) return
				if (!currentPoll.success) throw new Error('Poll unavailable')
				// GetFees returns eleven sint64 fields; pollVoteFee is the third.
				const bytes = Uint8Array.from(atob(fees.responseData), (char) => char.charCodeAt(0))
				if (bytes.length !== 88) throw new Error('Fees unavailable')
				const voteFee = Number(new DataView(bytes.buffer).getBigInt64(16, true))
				const lastAmount = voteFee + (poll.id + 1) * QUTIL_CONFIG.MAX_OPTIONS
				if (
					!Number.isSafeInteger(poll.id) ||
					poll.id < 0 ||
					!Number.isSafeInteger(voteFee) ||
					voteFee < 0 ||
					!Number.isSafeInteger(lastAmount)
				) {
					throw new Error('Invalid transfer amount')
				}
				setAmounts(
					currentPoll.data.found && currentPoll.data.poll_info.is_active
						? Array.from(
								{ length: QUTIL_CONFIG.MAX_OPTIONS },
								(_, option) =>
									voteFee + poll.id * QUTIL_CONFIG.MAX_OPTIONS + option + 1
							)
						: []
				)
				setLabels(optionLabels)
			} catch {
				if (!cancelled) setError(true)
			} finally {
				if (!cancelled) timer = setTimeout(load, 60_000)
			}
		}
		void load()
		return () => {
			cancelled = true
			clearTimeout(timer)
		}
	}, [poll.id, querySmartContract, getPollInfo, refresh])

	// Same labels as VoteForm so users pick the matching option.
	const isBinaryPoll =
		!labels && !poll.results?.result?.some((votes, index) => index >= 2 && votes > 0)
	const getOptionLabel = (option: number): string => {
		if (labels?.[option]) return labels[option]
		if (isBinaryPoll && option < 2) return `Option ${option} - ${option === 0 ? 'No' : 'Yes'}`
		return `Option ${option}`
	}

	return (
		<section className="bg-muted space-y-3 rounded-lg p-4" aria-label="Vote by transfer">
			<h4 className="font-medium">Vote by transfer</h4>
			<p className="text-sm">
				From the wallet holding your QU or eligible assets, send a normal QU transfer to
				QUtil. No wallet connection to this site is needed.
			</p>
			{error ? (
				<p role="alert" className="text-sm">
					Could not load transfer amounts. Retry before sending any QU.
				</p>
			) : amounts === null ? (
				<p role="status" className="text-sm">
					Loading current transfer amounts…
				</p>
			) : !amounts.some((amount) => amount > 0) ? (
				<p role="status" className="text-sm">
					Transfer voting is unavailable for this poll.
				</p>
			) : (
				<>
					<div className="flex items-center gap-2">
						<div className="min-w-0">
							<p className="text-sm font-medium">QUtil contract address</p>
							<code className="text-xs break-all">{QUTIL_CONFIG.ADDRESS}</code>
						</div>
						<CopyButton text={QUTIL_CONFIG.ADDRESS} tooltipText="Copy QUtil address" />
					</div>
					<p className="text-sm">
						Send exactly the amount shown for your option. It already includes the vote
						fee. The full payment is burned. An unmatched amount is refunded minus the
						current vote fee (or fully burned if smaller than the fee).
					</p>
					<p className="text-sm">
						An extra QU may select a different option. Voting power uses your remaining
						eligible balance, which must meet this poll’s minimum. Refresh before
						sending; these amounts stop working when the poll closes.
					</p>
					<div className="max-h-72 overflow-auto">
						<table className="w-full text-sm">
							<thead>
								<tr>
									<th className="text-left">Option</th>
									<th className="text-right">Send exactly</th>
								</tr>
							</thead>
							<tbody>
								{amounts.map(
									(amount, option) =>
										amount > 0 &&
										(!labels || option in labels) && (
											<tr key={option} className="border-t">
												<td className="py-2">{getOptionLabel(option)}</td>
												<td className="py-2 text-right whitespace-nowrap">
													{amount.toLocaleString()} QU
													<CopyButton
														text={amount.toString()}
														tooltipText={`Copy amount for option ${option}`}
													/>
												</td>
											</tr>
										)
								)}
							</tbody>
						</table>
					</div>
				</>
			)}
			<Button variant="outline" size="sm" onClick={() => setRefresh((value) => value + 1)}>
				Refresh amounts
			</Button>
		</section>
	)
}
