'use client'

import { XIcon, Zap } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import PortalModalWrapper from '@/components/modals/PortalModalWrapper'
import { Button } from '@/components/ui/button'
import { TOASTS_DURATIONS } from '@/constants/toasts-durations'
import { useAppDispatch, useAppSelector, useQUtilContract } from '@/hooks'
import { getToastErrorMessage } from '@/lib/errors'
import { QUTIL_CONFIG } from '@/lib/qubic/constants'
import { hideModal, selectModal } from '@/store/slices/modal.slice'

import { Badge, Card, CardAction, CardContent, CardFooter, CardHeader } from '../ui'

export default function CancelPollConfirmationModal() {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { modalProps } = useAppSelector(selectModal)
	const { cancelPoll } = useQUtilContract()
	const [isCanceling, setIsCanceling] = useState(false)

	// Type guard to ensure modalProps is defined and has the correct type
	if (!modalProps || !('pollId' in modalProps)) {
		return null
	}

	const { pollId, pollName } = modalProps

	const handleCancelPoll = async () => {
		setIsCanceling(true)
		const pendingToast = toast.loading('Please approve the transaction in your wallet', {
			duration: TOASTS_DURATIONS.PENDING,
			action: { label: 'Dismiss', onClick: () => toast.dismiss(pendingToast) }
		})
		try {
			const result = await cancelPoll(parseInt(pollId))

			if (!result.success) {
				throw new Error('Failed to cancel poll, please try again')
			}

			toast.success(`Poll cancelled successfully at tick ${result.tick}`)
			dispatch(hideModal())
		} catch (error) {
			console.error('Error cancelling poll:', error)
			toast.error(`Error cancelling poll: ${getToastErrorMessage(error, t)}`)
		} finally {
			setIsCanceling(false)
			toast.dismiss(pendingToast)
		}
	}

	const handleClose = () => {
		dispatch(hideModal())
	}

	return (
		<PortalModalWrapper
			id="cancel-poll-confirmation-modal"
			isOpen={true}
			closeOnOutsideClick={true}
			onClose={handleClose}
		>
			<Card className="relative w-full max-w-md">
				<CardHeader className="text-center">
					<h2 className="text-xl font-semibold">Cancel Poll</h2>
					<CardAction>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute top-1.5 right-1.5"
							onClick={handleClose}
							aria-label="close-button"
						>
							<XIcon className="text-muted-foreground size-5" />
						</Button>
					</CardAction>
				</CardHeader>

				<CardContent className="space-y-4">
					<p className="text-muted-foreground text-sm">
						Are you sure you want to cancel the poll "{pollName}"? This action cannot be
						undone.
					</p>

					<Badge
						variant="outline"
						className="bg-warning/10 text-warning border-warning/20"
					>
						<Zap className="mr-1 h-3 w-3" />
						Fee: {QUTIL_CONFIG.POLL_CANCELLATION_FEE.toLocaleString()} QUBIC
					</Badge>
				</CardContent>

				<CardFooter className="flex gap-3">
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isCanceling}
						className="flex-1"
					>
						Keep Poll
					</Button>
					<Button
						variant="destructive"
						onClick={handleCancelPoll}
						disabled={isCanceling}
						className="flex-1"
					>
						{isCanceling ? 'Cancelling...' : 'Cancel Poll'}
					</Button>
				</CardFooter>
			</Card>
		</PortalModalWrapper>
	)
}
