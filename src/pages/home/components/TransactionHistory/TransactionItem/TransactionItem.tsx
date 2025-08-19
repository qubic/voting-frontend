'use client'

import { CheckCircle, ChevronDown, Clock, RefreshCw, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTxMonitor } from '@/hooks/useTxMonitor'
import type { PendingTransaction, TransactionStatus } from '@/types'

import { TransactionDetails } from './TransactionDetails'
import { TransactionError } from './TransactionError'
import { TransactionMetadata } from './TransactionMetadata'

const StatusIcon = ({ status }: { status: TransactionStatus }) => {
	switch (status) {
		case 'pending':
			return <Clock className="h-5 w-5 text-blue-500" />
		case 'success':
			return <CheckCircle className="h-5 w-5 text-green-500" />
		case 'failed':
			return <XCircle className="h-5 w-5 text-red-500" />
		default:
			return <Clock className="h-5 w-5 text-gray-500" />
	}
}

const getTransactionTypeLabel = (tx: PendingTransaction) => {
	switch (tx.type) {
		case 'createPoll':
			return 'Create Poll'
		case 'vote':
			return 'Cast Vote'
		case 'cancelPoll':
			return 'Cancel Poll'
		default:
			return 'Unknown'
	}
}

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
	switch (status) {
		case 'pending':
			return (
				<Badge variant="info">
					<div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
					Pending
				</Badge>
			)
		case 'success':
			return (
				<Badge variant="success">
					<CheckCircle className="mr-1 h-3 w-3" />
					Success
				</Badge>
			)
		case 'failed':
			return (
				<Badge variant="error">
					<XCircle className="mr-1 h-3 w-3" />
					Failed
				</Badge>
			)
		default:
			return <Badge variant="outline">{status}</Badge>
	}
}

const isRpcError = (errorMessage: string | undefined) => {
	if (!errorMessage) return false

	return (
		errorMessage.includes('Transaction not found') ||
		errorMessage.includes('Transaction check failed') ||
		errorMessage.includes('not found on network')
	)
}

interface TransactionItemProps {
	transaction: PendingTransaction
}

export const TransactionItem = ({ transaction }: TransactionItemProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const { refreshTransaction } = useTxMonitor()

	const handleToggle = () => {
		setIsExpanded(!isExpanded)
	}

	const handleRefresh = async () => {
		setIsRefreshing(true)
		try {
			await refreshTransaction(transaction.txHash)
		} finally {
			setIsRefreshing(false)
		}
	}

	return (
		<Card className="p-1">
			<CardContent className="p-0">
				{/* Compact Row View */}
				<div
					className="flex cursor-pointer flex-col gap-3 p-4 transition-colors hover:bg-gray-800/30 sm:flex-row sm:items-center sm:gap-4"
					onClick={handleToggle}
				>
					<div className="flex items-center gap-3 sm:flex-shrink-0">
						<StatusIcon status={transaction.status} />
						<span className="text-muted-foreground font-medium sm:hidden">
							{getTransactionTypeLabel(transaction)}
						</span>
					</div>

					<div className="min-w-0 flex-1">
						<div className="hidden items-center gap-2 sm:flex">
							<span className="text-muted-foreground mr-2 font-medium whitespace-nowrap">
								{getTransactionTypeLabel(transaction)}
							</span>
						</div>
					</div>

					<TransactionMetadata transaction={transaction} compact />

					{/* Status Badge and Expand Icon */}
					<div className="flex items-center justify-between gap-2 sm:flex-shrink-0 sm:gap-4">
						<StatusBadge status={transaction.status} />

						<ChevronDown
							className={`text-muted-foreground h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
						/>
					</div>
				</div>

				{/* Expanded Details */}
				{isExpanded && (
					<div className="space-y-4 border-t border-gray-700/50 bg-gray-800/20 p-4">
						{/* Expanded Header with Refresh Button */}
						<div className="flex items-center justify-between">
							<h4 className="text-muted-foreground text-sm font-medium">
								Transaction Details
							</h4>
							{transaction.status === 'failed' && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleRefresh}
									disabled={isRefreshing}
									className="h-8"
								>
									<RefreshCw
										className={`mr-2 h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
									/>
									Refresh Status
								</Button>
							)}
						</div>

						<TransactionDetails transaction={transaction} />
						<TransactionMetadata transaction={transaction} />

						{/* Error Message */}
						{transaction.errorMessage && (
							<TransactionError errorMessage={transaction.errorMessage} />
						)}

						{/* RPC Failure Explanation */}
						{transaction.status === 'failed' &&
							isRpcError(transaction.errorMessage) && (
								<div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
									<div className="flex items-start gap-2">
										<Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
										<div className="text-sm">
											<p className="mb-1 font-medium text-amber-500">
												Transaction may have succeeded
											</p>
											<p className="text-amber-600 dark:text-amber-400">
												Sometimes RPC calls fail to find transactions even
												when they succeed on the network. Use the refresh
												button above to check the current status, or check
												on the explorer.
											</p>
										</div>
									</div>
								</div>
							)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
