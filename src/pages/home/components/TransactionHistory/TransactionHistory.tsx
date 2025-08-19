'use client'

import { History } from 'lucide-react'
import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppSelector } from '@/hooks'
import { selectTransactions } from '@/store/slices/transactions.slice'

import { TransactionItem } from './TransactionItem'

export default function TransactionHistory() {
	const { pendingTransactions, transactionHistory } = useAppSelector(selectTransactions)

	// Get all transactions (both pending and completed from history)
	const allTransactions = useMemo(
		() => [
			...pendingTransactions,
			...transactionHistory.filter(
				(tx) => !pendingTransactions.some((ptx) => ptx.txHash === tx.txHash)
			)
		],
		[pendingTransactions, transactionHistory]
	)

	// Sort transactions by tick in descending order (higher ticks first)
	const sortedTransactions = useMemo(
		() => allTransactions.sort((a, b) => b.targetTick - a.targetTick),
		[allTransactions]
	)

	if (sortedTransactions.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12 text-center">
					<div className="mb-4 rounded-full bg-gray-800/50 p-3">
						<History className="h-8 w-8 text-gray-400" />
					</div>
					<h3 className="mb-2 text-lg font-medium text-white">No Transaction History</h3>
					<p className="max-w-sm text-gray-400">
						Your transaction history will appear here once you start creating polls,
						voting, or performing other actions.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-3 text-xl font-semibold text-white">
					<div className="rounded-full border border-gray-600/50 bg-gray-800/50 p-2">
						<History className="h-5 w-5 text-gray-300" />
					</div>
					Transaction History
					<span className="ml-auto inline-flex items-center rounded-full border border-gray-600/50 bg-gray-800/50 px-3 py-1 text-sm font-medium text-gray-300">
						{sortedTransactions.length}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{sortedTransactions.map((tx) => (
					<TransactionItem key={tx.txHash} transaction={tx} />
				))}
			</CardContent>
		</Card>
	)
}
