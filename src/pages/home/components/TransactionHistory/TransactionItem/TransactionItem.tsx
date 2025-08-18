'use client'

import { CheckCircle, ChevronDown, Clock, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

interface TransactionItemProps {
	transaction: PendingTransaction
}

export const TransactionItem = ({ transaction }: TransactionItemProps) => {
	const [isExpanded, setIsExpanded] = useState(false)

	const handleToggle = () => {
		setIsExpanded(!isExpanded)
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
						<TransactionDetails transaction={transaction} />
						<TransactionMetadata transaction={transaction} />

						{/* Error Message */}
						{transaction.errorMessage && (
							<TransactionError errorMessage={transaction.errorMessage} />
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
