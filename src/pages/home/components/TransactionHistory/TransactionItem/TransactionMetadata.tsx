import type { PendingTransaction } from '@/types'

interface TransactionMetadataProps {
	transaction: PendingTransaction
	compact?: boolean
}

export const TransactionMetadata = ({ transaction, compact = false }: TransactionMetadataProps) => {
	if (compact) {
		return (
			<div className="flex flex-col gap-1 text-xs sm:flex-row sm:gap-4">
				<div className="flex items-center gap-1">
					<span className="text-muted-foreground">Tick:</span>
					<span className="font-mono">{transaction.targetTick}</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="text-muted-foreground">Tx ID:</span>
					<span className="font-mono">
						{transaction.txHash.slice(0, 6)}...{transaction.txHash.slice(-6)}
					</span>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
			<div className="flex items-center gap-1">
				<span className="text-muted-foreground">Target Tick:</span>
				<span className="font-mono">{transaction.targetTick}</span>
			</div>
			<div className="flex items-center gap-1">
				<span className="font-medium">Tx ID:</span>
				<span className="font-mono font-medium">
					{transaction.txHash.slice(0, 8)}...
					{transaction.txHash.slice(-8)}
				</span>
			</div>
		</div>
	)
}
