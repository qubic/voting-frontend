import { XCircle } from 'lucide-react'

interface TransactionErrorProps {
	errorMessage: string
}

export const TransactionError = ({ errorMessage }: TransactionErrorProps) => {
	return (
		<div className="mt-3 rounded-lg border border-red-800/50 bg-red-900/20 p-3">
			<div className="flex items-center gap-2 text-red-300">
				<XCircle className="h-4 w-4" />
				<span className="text-sm font-medium">Error</span>
			</div>
			<p className="mt-1 text-sm text-red-200">{errorMessage}</p>
		</div>
	)
}
