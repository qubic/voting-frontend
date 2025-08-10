import { XIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { QubicConnectLogo } from '@/assets/icons'
import { Button } from '@/components/ui'
import { useAppDispatch, useWalletConnect } from '@/hooks'
import { hideModal } from '@/store/slices/modal.slice'

import PortalModalWrapper from '../PortalModalWrapper'

import { AccountSelectStep, ConnectionMethodSelectStep, ConnectWalletStep } from './components'
import { ModalStep } from './connect-wallet-modal.types'

export default function ConnectWalletModal() {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const [modalStep, setModalStep] = useState<ModalStep>(ModalStep.CONNECTION_METHOD_SELECT)

	const {
		session,
		connect: wcConnect,
		disconnect: wcDisconnect,
		accounts,
		selectedAccount: wcSelectedAccount,
		setSelectedAccount: setWcSelectedAccount,
		isWalletConnected
	} = useWalletConnect()

	const handleCloseModal = useCallback(() => {
		dispatch(hideModal())
	}, [dispatch])

	const handleModalStepChange = useCallback((step: ModalStep) => {
		setModalStep(step)
	}, [])

	const handleSelectWalletConnect = useCallback(async () => {
		setModalStep(ModalStep.WC_CONNECT_WALLET)
		await wcConnect()
	}, [wcConnect])

	const handleConfirmAccountSelection = useCallback(() => {
		toast.success(t('connect_wallet_modal.account_connected'))
		handleCloseModal()
	}, [handleCloseModal, t])

	const handleDisconnectWallet = useCallback(() => {
		if (session) {
			wcDisconnect()
			handleCloseModal()
		}
	}, [session, wcDisconnect, handleCloseModal])

	useEffect(() => {
		if (isWalletConnected && !wcSelectedAccount) {
			setModalStep(ModalStep.WC_ACCOUNT_SELECT)
		}
	}, [wcSelectedAccount, isWalletConnected])

	const renderModalContent = () => {
		switch (modalStep) {
			case ModalStep.CONNECTION_METHOD_SELECT:
				return (
					<ConnectionMethodSelectStep
						isWalletConnected={isWalletConnected}
						onModalStepChange={handleModalStepChange}
						onDisconnectWallet={handleDisconnectWallet}
						onSelectWalletConnect={handleSelectWalletConnect}
					/>
				)
			case ModalStep.WC_CONNECT_WALLET:
				return <ConnectWalletStep onModalStepChange={handleModalStepChange} />
			case ModalStep.WC_ACCOUNT_SELECT:
				return (
					<AccountSelectStep
						accounts={accounts}
						selectedAccount={wcSelectedAccount}
						setSelectedAccount={setWcSelectedAccount}
						onModalStepChange={handleModalStepChange}
						onConfirm={handleConfirmAccountSelection}
					/>
				)
			default:
				return null
		}
	}

	return (
		<PortalModalWrapper
			id="connect-wallet-modal"
			isOpen
			onClose={handleCloseModal}
			closeOnOutsideClick
		>
			<div className="bg-card relative mx-4 grid w-full max-w-120 rounded-lg border sm:mx-0">
				<header className="relative flex h-fit justify-between p-6">
					<QubicConnectLogo />
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="absolute top-2 ltr:right-2 rtl:left-2"
						onClick={handleCloseModal}
						aria-label="close-button"
					>
						<XIcon className="text-muted-foreground size-5" />
					</Button>
				</header>

				<div className="px-7 pt-3 pb-7">{renderModalContent()}</div>
			</div>
		</PortalModalWrapper>
	)
}
