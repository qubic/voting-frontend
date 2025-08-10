import { AlertTriangle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { TransactionResponse } from '@/services/transaction.service'

interface TransactionConfirmationModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => Promise<TransactionResponse>
	transactionDetails: {
		title: string
		description: string
		amount?: number
		fee?: number
		recipient?: string
		contractIndex?: number
		inputType?: number
	}
}

export function TransactionConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	transactionDetails
}: TransactionConfirmationModalProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<TransactionResponse | null>(null)
	const [error, setError] = useState<string | null>(null)

	const handleConfirm = async () => {
		setIsLoading(true)
		setError(null)
		setResult(null)

		try {
			const response = await onConfirm()
			setResult(response)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Transaction failed')
		} finally {
			setIsLoading(false)
		}
	}

	const handleClose = () => {
		if (!isLoading) {
			setResult(null)
			setError(null)
			onClose()
		}
	}

	const handleViewExplorer = () => {
		if (result?.explorerLink) {
			window.open(result.explorerLink, '_blank')
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{result ? (
							result.success ? (
								<CheckCircle className="h-5 w-5 text-green-500" />
							) : (
								<AlertTriangle className="h-5 w-5 text-red-500" />
							)
						) : (
							<AlertTriangle className="h-5 w-5 text-yellow-500" />
						)}
						{result ? 'Transaction Result' : 'Confirm Transaction'}
					</DialogTitle>
					<DialogDescription>
						{result
							? result.success
								? 'Your transaction has been processed successfully.'
								: 'Your transaction failed to process.'
							: 'Please review the transaction details before confirming.'}
					</DialogDescription>
				</DialogHeader>

				{!result && !error && (
					<div className="space-y-4">
						<div className="space-y-2">
							<h4 className="font-medium">{transactionDetails.title}</h4>
							<p className="text-muted-foreground text-sm">
								{transactionDetails.description}
							</p>
						</div>

						<Separator />

						<div className="space-y-2 text-sm">
							{transactionDetails.amount !== undefined && (
								<div className="flex justify-between">
									<span>Amount:</span>
									<span className="font-medium">
										{transactionDetails.amount.toLocaleString()} QUBIC
									</span>
								</div>
							)}
							{transactionDetails.fee !== undefined && (
								<div className="flex justify-between">
									<span>Fee:</span>
									<span className="font-medium">
										{transactionDetails.fee.toLocaleString()} QUBIC
									</span>
								</div>
							)}
							{transactionDetails.recipient && (
								<div className="flex justify-between">
									<span>Recipient:</span>
									<span className="font-mono text-xs">
										{transactionDetails.recipient.slice(0, 8)}...
										{transactionDetails.recipient.slice(-8)}
									</span>
								</div>
							)}
							{transactionDetails.contractIndex !== undefined && (
								<div className="flex justify-between">
									<span>Contract Index:</span>
									<span className="font-medium">
										{transactionDetails.contractIndex}
									</span>
								</div>
							)}
							{transactionDetails.inputType !== undefined && (
								<div className="flex justify-between">
									<span>Input Type:</span>
									<span className="font-medium">
										{transactionDetails.inputType}
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{result && (
					<div className="space-y-4">
						<div className="rounded-lg border p-4">
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-sm font-medium">Status:</span>
									<span
										className={`text-sm font-medium ${
											result.success ? 'text-green-600' : 'text-red-600'
										}`}
									>
										{result.success ? 'Success' : 'Failed'}
									</span>
								</div>
								{result.tick && (
									<div className="flex justify-between">
										<span className="text-sm">Tick:</span>
										<span className="font-mono text-sm">{result.tick}</span>
									</div>
								)}
								{result.txHash && result.txHash !== 'N/A' && (
									<div className="flex justify-between">
										<span className="text-sm">Transaction ID:</span>
										<span className="font-mono text-sm">
											{result.txHash.slice(0, 8)}...{result.txHash.slice(-8)}
										</span>
									</div>
								)}
								{result.message && (
									<div className="pt-2">
										<p className="text-muted-foreground text-sm">
											{result.message}
										</p>
									</div>
								)}
							</div>
						</div>

						{result.explorerLink && (
							<Button
								variant="outline"
								onClick={handleViewExplorer}
								className="w-full"
							>
								<ExternalLink className="mr-2 h-4 w-4" />
								View on Explorer
							</Button>
						)}
					</div>
				)}

				{error && (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4">
						<div className="flex items-start gap-2">
							<AlertTriangle className="mt-0.5 h-4 w-4 text-red-500" />
							<div>
								<h4 className="text-sm font-medium text-red-800">
									Transaction Failed
								</h4>
								<p className="mt-1 text-sm text-red-700">{error}</p>
							</div>
						</div>
					</div>
				)}

				<DialogFooter>
					{!result && !error && (
						<>
							<Button variant="outline" onClick={handleClose} disabled={isLoading}>
								Cancel
							</Button>
							<Button onClick={handleConfirm} disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									'Confirm Transaction'
								)}
							</Button>
						</>
					)}
					{result && (
						<Button onClick={handleClose} className="w-full">
							Close
						</Button>
					)}
					{error && (
						<Button onClick={handleClose} className="w-full">
							Close
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
