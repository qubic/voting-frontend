'use client'

import { SquareArrowOutUpRightIcon, Users, Vote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { useWalletConnect } from '@/hooks'
import { NULL_ID, POLL_TYPE, QUTIL_CONFIG, type VoteFormData, VoteSchema } from '@/lib/qubic'
import type { PollWithResults } from '@/types'

interface PollCardProps {
	poll: PollWithResults
	onVoteSuccess?: () => void
}

export default function PollCard({ poll, onVoteSuccess }: PollCardProps) {
	const [isVoting, setIsVoting] = useState(false)
	const [showVoteForm, setShowVoteForm] = useState(false)
	const { isWalletConnected, selectedAccount, walletClient } = useWalletConnect()

	const form = useForm<VoteFormData>({
		resolver: zodResolver(VoteSchema),
		defaultValues: {
			chosen_option: 0,
			amount: 0,
			poll_id: poll.id,
			address: selectedAccount?.address || ''
		}
	})

	// Update form when selectedAccount changes
	useEffect(() => {
		if (selectedAccount?.address) {
			form.setValue('address', selectedAccount.address)
		}
	}, [selectedAccount?.address, form])

	const isQubicPollType = poll.poll_type === POLL_TYPE.QUBIC
	const isActive = Boolean(poll.is_active)

	// Use actual poll results data
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

	const pollAllowedAssets = poll.allowed_assets.filter(
		(asset) => asset.issuer !== NULL_ID && asset.assetName !== 'N/A'
	)

	const onSubmit = async (data: VoteFormData) => {
		console.log('onSubmit', data)
		if (!isWalletConnected || !selectedAccount) {
			alert('Please connect your wallet first')
			return
		}

		if (!walletClient) {
			alert('Wallet client not initialized')
			return
		}

		// Ensure we have valid form data
		if (data.chosen_option === undefined || data.amount === undefined || !data.address) {
			alert('Please fill in all required fields')
			return
		}

		setIsVoting(true)
		try {
			// TODO: Replace with actual vote function using sendTransaction from walletClient
			const success = true
			if (success) {
				alert('Vote cast successfully!')
				setShowVoteForm(false)
				form.reset()
				onVoteSuccess?.()
			} else {
				alert('Failed to cast vote')
			}
		} finally {
			setIsVoting(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">{poll.poll_name}</CardTitle>
				{poll.poll_link && (
					<Tooltip>
						<TooltipTrigger asChild>
							<CardAction>
								<Button variant="ghost" size="icon" asChild>
									<a
										href={poll.poll_link}
										target="_blank"
										rel="noopener noreferrer"
									>
										<SquareArrowOutUpRightIcon />
									</a>
								</Button>
							</CardAction>
						</TooltipTrigger>
						<TooltipContent>
							<p>View on GitHub</p>
						</TooltipContent>
					</Tooltip>
				)}
				<div className="flex items-center gap-2">
					<Badge variant={isQubicPollType ? 'default' : 'secondary'}>
						{isQubicPollType ? 'Qubic' : 'Asset'}
					</Badge>
					<Badge variant="outline">
						Min: {poll.min_amount.toLocaleString()} {isQubicPollType ? 'QU' : 'Assets'}
					</Badge>
					{isActive && <Badge variant="default">Active</Badge>}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="text-muted-foreground flex items-center gap-4 text-sm">
					<div className="flex items-center gap-1">
						<Vote className="h-4 w-4" />
						{totalVotes.toLocaleString()} votes
					</div>
					<div className="flex items-center gap-1">
						<Users className="h-4 w-4" />
						{totalVoters} voters
					</div>
				</div>

				<div className="space-y-3">
					<h4 className="font-semibold">Results</h4>
					{pollResults.map((result, index) => {
						const percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
						return (
							<div key={index} className="space-y-1">
								<div className="flex justify-between text-sm">
									<span>Option {result.option}</span>
									<span>
										{result.votes.toLocaleString()} votes ({result.voterCount}{' '}
										voters)
									</span>
								</div>
								<Progress value={percentage} className="h-2" />
							</div>
						)
					})}
				</div>

				{!isQubicPollType && pollAllowedAssets.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-sm font-semibold">Allowed Assets</h4>
						<div className="flex flex-wrap gap-1">
							{pollAllowedAssets.slice(0, 3).map((asset, index) => (
								<Badge key={index} variant="outline" className="text-sm">
									{asset.assetName}
								</Badge>
							))}
							{pollAllowedAssets.length > 3 && (
								<Badge variant="outline" className="text-xs">
									+{pollAllowedAssets.length - 3} more
								</Badge>
							)}
						</div>
					</div>
				)}

				{isActive && (
					<div className="border-t pt-4">
						{!showVoteForm ? (
							<Button
								onClick={() => setShowVoteForm(true)}
								disabled={!isWalletConnected}
								className="w-full"
							>
								<Vote className="mr-2 h-4 w-4" />
								Cast Vote
							</Button>
						) : (
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
									<FormField
										control={form.control}
										name="chosen_option"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Option (0-63)</FormLabel>
												<Select
													value={field.value.toString()}
													onValueChange={(value) =>
														field.onChange(Number(value))
													}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select option" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Array.from(
															{ length: QUTIL_CONFIG.MAX_OPTIONS },
															(_, i) => (
																<SelectItem
																	key={i}
																	value={i.toString()}
																>
																	Option {i}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
												<FormDescription>
													Choose your voting option
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="amount"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Amount</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="Enter amount"
														value={field.value || ''}
														onChange={(e) =>
															field.onChange(Number(e.target.value))
														}
													/>
												</FormControl>
												<FormDescription>
													Amount to vote with
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="bg-muted rounded-lg p-3">
										<p className="text-muted-foreground text-sm">
											Voting fee:{' '}
											<Badge variant="secondary">
												{QUTIL_CONFIG.VOTE_FEE} QU
											</Badge>
										</p>
									</div>

									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowVoteForm(false)}
											className="flex-1"
										>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={isVoting || form.formState.isSubmitting}
											className="flex-1"
										>
											{isVoting || form.formState.isSubmitting
												? 'Voting...'
												: 'Vote'}
										</Button>
									</div>
								</form>
							</Form>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
