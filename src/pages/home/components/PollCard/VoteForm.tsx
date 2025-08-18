'use client'

import { Zap } from 'lucide-react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { zodResolver } from '@hookform/resolvers/zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { TOASTS_DURATIONS } from '@/constants/toasts-durations'
import { useQUtilContract, useWalletConnect } from '@/hooks'
import { getToastErrorMessage } from '@/lib/errors'
import { POLL_TYPE, QUTIL_CONFIG, type VoteFormData, VoteSchema } from '@/lib/qubic'
import {
	filterValidAssets,
	findMatchingUserAsset,
	hasAnyAllowedAsset,
	hasSufficientAssetBalance
} from '@/lib/qubic/asset-utils'
import { cn } from '@/lib/utils'
import type { PollWithResults } from '@/types'

interface VoteFormProps {
	poll: PollWithResults
	onCancel: () => void
}

export default function VoteForm({ poll, onCancel }: VoteFormProps) {
	const { t } = useTranslation()

	const { selectedAccount } = useWalletConnect()
	const { castVote } = useQUtilContract()

	const form = useForm<VoteFormData>({
		resolver: zodResolver(VoteSchema),
		defaultValues: {
			chosen_option: 0,
			amount: 0,
			poll_id: poll.id,
			address: selectedAccount?.address || ''
		}
	})

	const isQubicPollType = poll.poll_type === POLL_TYPE.QUBIC
	const pollAllowedAssets = filterValidAssets(poll.allowed_assets)

	// Validation function to check balance requirements
	const validateVoteRequirements = (
		data: VoteFormData
	): { isValid: boolean; errorMessage: string } => {
		if (!selectedAccount) {
			return { isValid: false, errorMessage: 'No wallet account selected' }
		}

		// Check if user has enough balance for the required amount + fee
		const totalNeeded = data.amount + QUTIL_CONFIG.VOTE_FEE

		if (totalNeeded > selectedAccount.amount) {
			return {
				isValid: false,
				errorMessage: `Insufficient QUBIC balance. You have ${selectedAccount.amount.toLocaleString()} QUBIC but need ${totalNeeded.toLocaleString()} QUBIC (${data.amount.toLocaleString()} required + ${QUTIL_CONFIG.VOTE_FEE} fee) to vote.`
			}
		}

		// Check if user meets the minimum amount requirement
		if (data.amount < poll.min_amount) {
			return {
				isValid: false,
				errorMessage: `Vote amount must be at least ${poll.min_amount.toLocaleString()} ${isQubicPollType ? 'QUBIC' : 'assets'} to participate in this poll.`
			}
		}

		// For asset polls, check if user has any of the allowed assets with sufficient balance
		if (poll.poll_type === POLL_TYPE.ASSET) {
			// First check if user has any of the allowed assets at all
			if (!hasAnyAllowedAsset(pollAllowedAssets, selectedAccount.assets)) {
				return {
					isValid: false,
					errorMessage: `You don't have any of the assets required for this poll. This poll only allows specific assets.`
				}
			}

			// Then check if any of the allowed assets have sufficient balance
			if (
				!hasSufficientAssetBalance(
					pollAllowedAssets,
					selectedAccount.assets,
					poll.min_amount
				)
			) {
				return {
					isValid: false,
					errorMessage: `You have some of the allowed assets but not enough balance. Required minimum: ${poll.min_amount.toLocaleString()} assets.`
				}
			}
		}

		return { isValid: true, errorMessage: '' }
	}

	// Helper functions for cleaner conditional logic
	const getVoteStatus = (): { type: 'error' | 'warning' | 'success'; message: string } | null => {
		if (!selectedAccount || (form.watch('amount') || 0) <= 0) return null

		const amount = form.watch('amount') || 0
		const totalNeeded = amount + QUTIL_CONFIG.VOTE_FEE

		if (totalNeeded > selectedAccount.amount) {
			return {
				type: 'error' as const,
				message: `Cannot vote: Required amount + fee (${totalNeeded.toLocaleString()} QUBIC) exceeds your balance (${selectedAccount.amount.toLocaleString()} QUBIC)`
			}
		}

		if (amount < poll.min_amount) {
			return {
				type: 'warning' as const,
				message: `Vote amount must be at least ${poll.min_amount.toLocaleString()} ${isQubicPollType ? 'QUBIC' : 'assets'}`
			}
		}

		if (
			poll.poll_type === POLL_TYPE.ASSET &&
			!hasSufficientAssetBalance(pollAllowedAssets, selectedAccount.assets, poll.min_amount)
		) {
			return {
				type: 'error' as const,
				message:
					"Cannot vote: You don't have sufficient balance of any allowed assets for this poll"
			}
		}

		return {
			type: 'success' as const,
			message: `Ready to vote! Required: ${amount.toLocaleString()} ${isQubicPollType ? 'QUBIC' : 'assets'} + ${QUTIL_CONFIG.VOTE_FEE} QUBIC fee`
		}
	}

	const canSubmitVote = (): boolean => {
		if (!selectedAccount || form.formState.isSubmitting) return false

		const amount = form.watch('amount') || 0
		const totalNeeded = amount + QUTIL_CONFIG.VOTE_FEE

		// For QUBIC polls, only check QUBIC balance and minimum amount
		if (poll.poll_type === POLL_TYPE.QUBIC) {
			return totalNeeded <= selectedAccount.amount && amount >= poll.min_amount
		}

		// For asset polls, check asset balance requirements
		if (poll.poll_type === POLL_TYPE.ASSET) {
			return (
				totalNeeded <= selectedAccount.amount &&
				amount >= poll.min_amount &&
				hasSufficientAssetBalance(
					pollAllowedAssets,
					selectedAccount.assets,
					poll.min_amount
				)
			)
		}

		return false
	}

	const getAssetBalanceDisplay = (): React.ReactNode => {
		if (!selectedAccount || poll.poll_type !== POLL_TYPE.ASSET) return null

		const userHasAnyAllowedAsset = hasAnyAllowedAsset(pollAllowedAssets, selectedAccount.assets)

		if (!userHasAnyAllowedAsset) {
			return (
				<div className="text-sm text-red-600 dark:text-red-400">
					⚠️ You don't have any of the assets required for this poll. This poll only
					allows specific assets.
				</div>
			)
		}

		return (
			<>
				<div className="space-y-2">
					{pollAllowedAssets.map((pollAsset) => {
						const userAsset = findMatchingUserAsset(pollAsset, selectedAccount.assets)
						const hasSufficientBalance =
							userAsset && userAsset.ownedAmount >= poll.min_amount

						return (
							<div
								key={`${pollAsset.issuer}-${pollAsset.assetName}`}
								className="flex items-center justify-between"
							>
								<span className="text-sm">
									{pollAsset.assetName} ({pollAsset.issuer.slice(0, 8)}...)
								</span>
								<span
									className={cn(
										'text-sm font-medium',
										hasSufficientBalance
											? 'text-green-600 dark:text-green-400'
											: 'text-red-600 dark:text-red-400'
									)}
								>
									{userAsset ? userAsset.ownedAmount.toLocaleString() : '0'}
								</span>
							</div>
						)
					})}
				</div>
				<p className="text-muted-foreground mt-2 text-xs">
					Minimum required: {poll.min_amount.toLocaleString()}{' '}
					{isQubicPollType ? 'QUBIC' : 'assets'} + {QUTIL_CONFIG.VOTE_FEE} QUBIC fee
				</p>
			</>
		)
	}

	const getVoteStatusDisplay = (): React.ReactNode => {
		const status = getVoteStatus()
		if (!status) return null

		const statusStyles = {
			error: 'text-red-600 dark:text-red-400',
			warning: 'text-amber-600 dark:text-amber-400',
			success: 'text-green-600 dark:text-green-400'
		}

		return (
			<div className={`mt-3 rounded-lg p-3 text-sm ${statusStyles[status.type]}`}>
				{status.message}
			</div>
		)
	}

	const onSubmit = async (data: VoteFormData) => {
		// Validate balance requirements before submitting
		const validation = validateVoteRequirements(data)
		if (!validation.isValid) {
			toast.error(validation.errorMessage)
			return
		}

		const pendingToast = toast.loading('Please approve the vote transaction in your wallet', {
			duration: TOASTS_DURATIONS.PENDING
		})

		try {
			const voteResult = await castVote(data)

			if (!voteResult.success) {
				throw new Error('Something went wrong while casting the vote. Please try again.')
			}

			toast.success(`Vote cast will be processed at tick ${voteResult.tick}`)
			form.reset()
		} catch (error) {
			console.error('Error casting vote', error)
			toast.error(`Error casting vote: ${getToastErrorMessage(error, t)}`)
		} finally {
			toast.dismiss(pendingToast)
		}
	}

	// Update form when selected account changes
	useEffect(() => {
		if (selectedAccount?.address) {
			form.setValue('address', selectedAccount.address)
		}
	}, [selectedAccount?.address, form])

	return (
		<>
			{/* Asset balance information for asset polls */}
			{poll.poll_type === POLL_TYPE.ASSET && selectedAccount && (
				<div className="bg-muted mb-4 rounded-lg p-4">
					<h4 className="mb-2 font-medium">Your Asset Balances</h4>
					{getAssetBalanceDisplay()}
				</div>
			)}

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
									onValueChange={(value) => field.onChange(Number(value))}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select option" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Array.from(
											{
												length: QUTIL_CONFIG.MAX_OPTIONS
											},
											(_, i) => (
												<SelectItem key={i} value={i.toString()}>
													Option {i}
												</SelectItem>
											)
										)}
									</SelectContent>
								</Select>
								<FormDescription>Choose your voting option</FormDescription>
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
										onChange={(e) => field.onChange(Number(e.target.value))}
										min={poll.min_amount}
										max={selectedAccount?.amount || undefined}
									/>
								</FormControl>
								<FormDescription>
									Amount to vote with
									{selectedAccount && (
										<>
											<br />
											<span className="text-foreground">
												Your balance:{' '}
												{selectedAccount.amount.toLocaleString()} QUBIC
											</span>
											<br />
											<span className="text-amber-600 dark:text-amber-500">
												Minimum required: {poll.min_amount.toLocaleString()}{' '}
												{isQubicPollType ? 'QUBIC' : 'assets'} +{' '}
												{QUTIL_CONFIG.VOTE_FEE} QUBIC fee
											</span>
										</>
									)}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="bg-muted rounded-lg p-3">
						<Badge
							variant="outline"
							className="bg-warning/10 text-warning border-warning/20"
						>
							<Zap className="mr-1 h-3 w-3" />
							Voting Fee: {QUTIL_CONFIG.VOTE_FEE} QUBIC
						</Badge>
						{selectedAccount && (form.watch('amount') || 0) > 0 && (
							<>
								<p className="text-muted-foreground mt-1 text-sm">
									Required amount: {(form.watch('amount') || 0).toLocaleString()}{' '}
									{isQubicPollType ? 'QUBIC' : 'assets'} (you need this but don't
									spend it)
								</p>
								<p className="text-muted-foreground mt-1 text-sm">
									Total needed: {(form.watch('amount') || 0).toLocaleString()} +{' '}
									{QUTIL_CONFIG.VOTE_FEE} ={' '}
									{(
										(form.watch('amount') || 0) + QUTIL_CONFIG.VOTE_FEE
									).toLocaleString()}{' '}
									QUBIC (required + fee)
								</p>
								{(form.watch('amount') || 0) + QUTIL_CONFIG.VOTE_FEE >
									selectedAccount.amount && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">
											⚠️ Insufficient balance for required amount + fee
										</p>
									)}
							</>
						)}
					</div>

					{/* Additional validation feedback */}
					{getVoteStatusDisplay()}

					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!canSubmitVote()} className="flex-1">
							{form.formState.isSubmitting ? 'Voting...' : 'Vote'}
						</Button>
					</div>
				</form>
			</Form>
		</>
	)
}
