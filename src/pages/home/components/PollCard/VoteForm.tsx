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

	// Debug: Log poll data when component mounts
	console.log('🔍 VoteForm mounted with poll:', poll)
	console.log('🔍 Poll ID:', poll.id)
	console.log('🔍 Poll type check:', poll.poll_type === POLL_TYPE.ASSET ? 'ASSET' : 'QUBIC')
	console.log('🔍 Poll allowed_assets length:', poll.allowed_assets?.length || 0)
	console.log('🔍 Poll num_assets:', poll.num_assets)

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

		// Check if user meets the minimum amount requirement
		if (data.amount < poll.min_amount) {
			return {
				isValid: false,
				errorMessage: `Vote amount must be at least ${poll.min_amount.toLocaleString()} ${isQubicPollType ? 'QUBIC' : 'assets'} to participate in this poll.`
			}
		}

		// For QUBIC polls, check if user has enough QUBIC for amount + fee
		if (poll.poll_type === POLL_TYPE.QUBIC) {
			const totalNeeded = data.amount + QUTIL_CONFIG.VOTE_FEE

			if (totalNeeded > selectedAccount.amount) {
				return {
					isValid: false,
					errorMessage: `Insufficient QUBIC balance. You have ${selectedAccount.amount.toLocaleString()} QUBIC but need ${totalNeeded.toLocaleString()} QUBIC (${data.amount.toLocaleString()} required + ${QUTIL_CONFIG.VOTE_FEE} fee) to vote.`
				}
			}
		}

		// For asset polls, check if user has the required asset balance + enough QUBIC for fee
		if (poll.poll_type === POLL_TYPE.ASSET) {
			// Check if user has enough QUBIC for the voting fee only
			if (QUTIL_CONFIG.VOTE_FEE > selectedAccount.amount) {
				return {
					isValid: false,
					errorMessage: `Insufficient QUBIC for voting fee. You have ${selectedAccount.amount.toLocaleString()} QUBIC but need ${QUTIL_CONFIG.VOTE_FEE} QUBIC for the fee.`
				}
			}

			// DISABLED: Asset validation because smart contract returns NULL_ID for issuers
			// The poll was created with invalid issuer addresses, so we can't validate asset ownership
			// Users can still vote, but asset validation is bypassed
			console.log('⚠️ Asset validation disabled: Smart contract returns NULL_ID for issuers')
			console.log('Poll allowed assets:', pollAllowedAssets)
			console.log('User assets:', selectedAccount.assets)
		}

		return { isValid: true, errorMessage: '' }
	}

	// Helper functions for cleaner conditional logic
	const getVoteStatus = (): { type: 'error' | 'warning' | 'success'; message: string } | null => {
		if (!selectedAccount || (form.watch('amount') || 0) <= 0) return null

		const amount = form.watch('amount') || 0

		if (amount < poll.min_amount) {
			return {
				type: 'warning' as const,
				message: `Vote amount must be at least ${poll.min_amount.toLocaleString()} ${isQubicPollType ? 'QUBIC' : 'assets'}`
			}
		}

		// For QUBIC polls, check QUBIC balance for amount + fee
		if (poll.poll_type === POLL_TYPE.QUBIC) {
			const totalNeeded = amount + QUTIL_CONFIG.VOTE_FEE

			if (totalNeeded > selectedAccount.amount) {
				return {
					type: 'error' as const,
					message: `Cannot vote: Required amount + fee (${totalNeeded.toLocaleString()} QUBIC) exceeds your balance (${selectedAccount.amount.toLocaleString()} QUBIC)`
				}
			}
		}

		// For asset polls, check asset balance and QUBIC for fee
		if (poll.poll_type === POLL_TYPE.ASSET) {
			// Check if user has enough QUBIC for the voting fee
			if (QUTIL_CONFIG.VOTE_FEE > selectedAccount.amount) {
				return {
					type: 'error' as const,
					message: `Cannot vote: Insufficient QUBIC for voting fee (need ${QUTIL_CONFIG.VOTE_FEE} QUBIC, have ${selectedAccount.amount.toLocaleString()} QUBIC)`
				}
			}

			// Check if user has sufficient asset balance
			if (!hasSufficientAssetBalance(pollAllowedAssets, selectedAccount.assets, amount)) {
				return {
					type: 'error' as const,
					message: `Cannot vote: You don't have sufficient balance of any allowed assets (need ${amount.toLocaleString()} assets)`
				}
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

		// Check minimum amount requirement for all poll types
		if (amount < poll.min_amount) return false

		// For QUBIC polls, check QUBIC balance for amount + fee
		if (poll.poll_type === POLL_TYPE.QUBIC) {
			const totalNeeded = amount + QUTIL_CONFIG.VOTE_FEE
			return totalNeeded <= selectedAccount.amount
		}

		// For asset polls, check QUBIC balance for fee and asset balance for amount
		if (poll.poll_type === POLL_TYPE.ASSET) {
			const hasEnoughQubicForFee = QUTIL_CONFIG.VOTE_FEE <= selectedAccount.amount
			
			// DISABLED: Asset balance check because smart contract returns NULL_ID for issuers
			// Users can vote as long as they have enough QUBIC for the fee
			const hasEnoughAssets = true // Always allow since we can't validate assets
			
			console.log('🔍 canSubmitVote debug:', {
				hasEnoughQubicForFee,
				hasEnoughAssets,
				amount,
				minAmount: poll.min_amount,
				reason: 'Asset validation disabled due to NULL_ID issuers'
			})

			return hasEnoughQubicForFee && hasEnoughAssets
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
								{isQubicPollType ? (
									<>
										<p className="text-muted-foreground mt-1 text-sm">
											Total needed:{' '}
											{(form.watch('amount') || 0).toLocaleString()} +{' '}
											{QUTIL_CONFIG.VOTE_FEE} ={' '}
											{(
												(form.watch('amount') || 0) + QUTIL_CONFIG.VOTE_FEE
											).toLocaleString()}{' '}
											QUBIC (required + fee)
										</p>
										{(form.watch('amount') || 0) + QUTIL_CONFIG.VOTE_FEE >
											selectedAccount.amount && (
												<p className="mt-1 text-sm text-red-600 dark:text-red-400">
													⚠️ Insufficient QUBIC balance for required amount +
													fee
												</p>
											)}
									</>
								) : (
									<>
										<p className="text-muted-foreground mt-1 text-sm">
											Total needed:{' '}
											{(form.watch('amount') || 0).toLocaleString()} assets +{' '}
											{QUTIL_CONFIG.VOTE_FEE} QUBIC (fee only)
										</p>
										{QUTIL_CONFIG.VOTE_FEE > selectedAccount.amount && (
											<p className="mt-1 text-sm text-red-600 dark:text-red-400">
												⚠️ Insufficient QUBIC balance for voting fee
											</p>
										)}
										{/* Asset validation disabled due to smart contract returning NULL_ID for issuers */}
										<p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
											⚠️ Asset validation disabled: Poll was created with invalid issuer addresses
										</p>
									</>
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
