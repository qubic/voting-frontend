import { useTranslation } from 'react-i18next'

import { Button } from '@/components/buttons'
import { Badge } from '@/components/ui'

import { ModalStep } from '../connect-wallet-modal.types'

interface Props {
	isWalletConnected: boolean
	onModalStepChange: (step: ModalStep) => void
	onDisconnectWallet: () => void
	onSelectWalletConnect: () => void
}

export default function ConnectionMethodSelectStep({
	isWalletConnected,
	onModalStepChange,
	onDisconnectWallet,
	onSelectWalletConnect
}: Props) {
	const { t } = useTranslation()
	return (
		<div className="flex flex-col gap-4">
			{isWalletConnected ? (
				<>
					<Button onClick={() => onModalStepChange(ModalStep.WC_ACCOUNT_SELECT)}>
						{t('global.change_account')}
					</Button>
					<Button variant="outlined" onClick={onDisconnectWallet}>
						{t('global.lock_wallet')}
					</Button>
				</>
			) : (
				<>
					<Button onClick={onSelectWalletConnect}>
						<span>WalletConnect</span>
						<Badge className="uppercase" variant="secondary">
							{t('global.beta')}
						</Badge>
					</Button>
					<Button disabled>{t('connect_wallet_modal.metamask_cooming_soon')}</Button>
				</>
			)}
		</div>
	)
}
