import { XIcon } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, CopyButton } from '@/components/buttons'
import { Skeleton } from '@/components/ui/skeleton'
import { WalletConnectionStatus } from '@/contexts'
import { useWalletConnect } from '@/hooks'

import { ModalStep } from '../connect-wallet-modal.types'

const RETRYABLE_STATUSES = [
	WalletConnectionStatus.USER_REJECTED_CONNECTION,
	WalletConnectionStatus.PROPOSAL_EXPIRED,
	WalletConnectionStatus.ERROR
]

type Props = Readonly<{
	onModalStepChange: (step: ModalStep) => void
}>

function QrCodeSkeleton() {
	return (
		<>
			<Skeleton className="size-[300px]" />
			<Skeleton className="h-5 w-20.5" />
		</>
	)
}

function ConnectWalletContent({
	wcUri,
	status
}: {
	wcUri?: string
	status: WalletConnectionStatus
}) {
	const { t } = useTranslation()

	const statusContentMap: Partial<Record<WalletConnectionStatus, React.JSX.Element | null>> = {
		[WalletConnectionStatus.CONNECTING]: !wcUri ? (
			<>
				<p>{t('connect_wallet_modal.scan_qr')}</p>
				<QrCodeSkeleton />
			</>
		) : null,
		[WalletConnectionStatus.USER_REJECTED_CONNECTION]: (
			<>
				<div className="flex flex-col items-center gap-3">
					<h2 className="text-2xl font-bold">{t('global.declined')}</h2>
					<div className="size-fit rounded-full bg-red-500">
						<XIcon className="text-primary-70 size-4" />
					</div>
				</div>
				<p>{t('connect_wallet_modal.user_rejected_connection')}</p>
			</>
		),
		[WalletConnectionStatus.PROPOSAL_EXPIRED]: (
			<p>{t('connect_wallet_modal.wallet_connection_expired')}</p>
		),
		[WalletConnectionStatus.ERROR]: (
			<p className="text-red-500">
				{t('connect_wallet_modal.wallet_connection_gen_url_error')}
			</p>
		)
	}

	if (statusContentMap[status]) {
		return statusContentMap[status]
	}

	if (wcUri) {
		return (
			<>
				<p>{t('connect_wallet_modal.scan_qr')}</p>
				<QRCodeCanvas value={wcUri} size={300} className="size-50 rounded" marginSize={1} />
				<div>
					<CopyButton text={wcUri} className="text-sm">
						{t('connect_wallet_modal.copy_uri')}
					</CopyButton>
				</div>
			</>
		)
	}

	return null
}

export default function ConnectWalletStep({ onModalStepChange }: Props) {
	const { t } = useTranslation()
	const { wcUri, status, connect } = useWalletConnect()

	const handleCancel = useCallback(
		() => onModalStepChange(ModalStep.CONNECTION_METHOD_SELECT),
		[onModalStepChange]
	)

	const shouldShowRetry = useMemo(() => RETRYABLE_STATUSES.includes(status), [status])

	return (
		<div className="grid place-items-center gap-6">
			<ConnectWalletContent wcUri={wcUri} status={status} />
			<div className="flex w-full gap-2">
				<Button variant="outlined" onClick={handleCancel}>
					{t('global.cancel')}
				</Button>
				{shouldShowRetry && <Button onClick={connect}>{t('global.try_again')}</Button>}
			</div>
		</div>
	)
}
