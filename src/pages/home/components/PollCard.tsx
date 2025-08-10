'use client'

import { Users, Vote } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { POLL_TYPE, type QUtilPollResponse, type VoteFormData, VoteSchema } from '@/lib/qubic'
import type { GetCurrentResultResponse } from '@/lib/qubic/schemas'

interface PollWithResults extends QUtilPollResponse {
	id: number
	results?: GetCurrentResultResponse
}

interface PollCardProps {
	poll: PollWithResults
	onVoteSuccess?: () => void
}

export default function PollCard({ poll, onVoteSuccess }: PollCardProps) {
	const [isVoting, setIsVoting] = useState(false)
	const [showVoteForm, setShowVoteForm] = useState(false)
	const { isWalletConnected, selectedAccount, walletClient } = useWalletConnect()

	const form = useForm<VoteFormData>({
		resolver: zodResolver(VoteSchema)
	})

	const isQubicPollType = poll.poll_type === POLL_TYPE.QUBIC

	// Use actual poll results data
	const totalVotes =
		poll.results?.result?.reduce((sum, votes) => sum + parseInt(votes, 10), 0) || 0
	const totalVoters =
		poll.results?.voter_count?.reduce((sum, count) => sum + parseInt(count, 10), 0) || 0

	// Create poll results array from actual data
	const pollResults = Array.from({ length: 64 }, (_, i) => {
		const votes = poll.results?.result?.[i] ? parseInt(poll.results.result[i], 10) : 0
		const voterCount = poll.results?.voter_count?.[i]
			? parseInt(poll.results.voter_count[i], 10)
			: 0
		return {
			option: i,
			votes,
			voterCount
		}
	})

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
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<CardTitle className="text-lg">{poll.poll_name}</CardTitle>
						<div className="flex items-center gap-2">
							<Badge variant={isQubicPollType ? 'default' : 'secondary'}>
								{isQubicPollType ? 'Qubic' : 'Asset'}
							</Badge>
							<Badge variant="outline">
								Min: {poll.min_amount.toLocaleString()}{' '}
								{isQubicPollType ? 'QU' : 'Assets'}
							</Badge>
							{poll.is_active && <Badge variant="default">Active</Badge>}
						</div>
					</div>
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

				{!isQubicPollType && poll.allowed_assets.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-sm font-semibold">Allowed Assets</h4>
						<div className="flex flex-wrap gap-1">
							{poll.allowed_assets.slice(0, 3).map((asset, index) => (
								<Badge key={index} variant="outline" className="text-xs">
									{asset.assetName}
								</Badge>
							))}
							{poll.allowed_assets.length > 3 && (
								<Badge variant="outline" className="text-xs">
									+{poll.allowed_assets.length - 3} more
								</Badge>
							)}
						</div>
					</div>
				)}

				{poll.is_active && (
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
														{Array.from({ length: 64 }, (_, i) => (
															<SelectItem
																key={i}
																value={i.toString()}
															>
																Option {i}
															</SelectItem>
														))}
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
														{...field}
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
											Voting fee: <Badge variant="secondary">100 QU</Badge>
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
