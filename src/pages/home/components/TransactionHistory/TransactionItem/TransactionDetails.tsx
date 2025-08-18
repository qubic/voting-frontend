import type { PendingTransaction } from '@/types'

interface TransactionDetailsProps {
	transaction: PendingTransaction
}

export const TransactionDetails = ({ transaction }: TransactionDetailsProps) => {
	switch (transaction.type) {
		case 'createPoll':
			return (
				<div className="space-y-2">
					<div className="space-y-1 text-sm text-gray-300">
						<div className="flex items-center gap-2">
							<span className="font-medium text-gray-400">Name:</span>
							<span className="text-white">
								{transaction.data.poll_name || 'Untitled Poll'}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-medium text-gray-400">Type:</span>
							<span className="inline-flex items-center rounded-full border border-purple-700/50 bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-300">
								{transaction.data.poll_type === 1 ? 'Qubic' : 'Asset'}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-medium text-gray-400">Min Amount:</span>
							<span className="font-mono text-white">
								{transaction.data.min_amount} QUBIC
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-medium text-gray-400">GitHub:</span>
							<a
								href={transaction.data.github_link}
								target="_blank"
								rel="noopener noreferrer"
								className="max-w-[600px] text-blue-400 underline hover:text-blue-300"
							>
								{transaction.data.github_link}
							</a>
						</div>
						{transaction.data.allowed_assets &&
							transaction.data.allowed_assets.length > 0 && (
								<div className="flex items-center gap-2">
									<span className="font-medium text-gray-400">Assets:</span>
									<div className="flex flex-wrap gap-1">
										{transaction.data.allowed_assets.map((asset, index) => (
											<span
												key={index}
												className="inline-flex items-center rounded-full border border-gray-600/50 bg-gray-800/50 px-2 py-1 text-xs font-medium text-gray-300"
											>
												{asset.assetName}
											</span>
										))}
									</div>
								</div>
							)}
					</div>
				</div>
			)
		case 'vote':
			return (
				<div className="space-y-2">
					<div className="space-y-1 text-sm text-gray-300">
						<div className="flex items-center gap-2">
							<span className="font-medium text-gray-400">Option:</span>
							<span className="inline-flex items-center rounded-full border border-green-700/50 bg-green-900/30 px-2 py-1 text-xs font-medium text-green-300">
								{transaction.data.chosen_option}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-medium text-gray-400">Amount:</span>
							<span className="font-mono text-white">
								{transaction.data.amount} QUBIC
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-medium text-gray-400">Poll ID:</span>
							<span className="font-mono text-white">
								#{transaction.data.poll_id}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-medium text-gray-400">Address:</span>
							<span className="font-mono text-xs font-medium text-white">
								{transaction.data.address.slice(0, 8)}...
								{transaction.data.address.slice(-8)}
							</span>
						</div>
					</div>
				</div>
			)
		case 'cancelPoll':
			return (
				<div className="space-y-2">
					<div className="space-y-1 text-sm text-gray-300">
						<div className="flex items-center gap-2">
							<span className="font-medium text-gray-400">Poll ID:</span>
							<span className="font-mono text-white">
								#{transaction.data.poll_id}
							</span>
						</div>
					</div>
				</div>
			)
		default:
			return <div className="text-sm text-gray-300">Unknown transaction type</div>
	}
}
