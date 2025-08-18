import { z } from 'zod'

import { useAppSelector } from '@/hooks'
import { type ModalProps, ModalType, selectModal } from '@/store/slices/modal.slice'

import CancelPollConfirmationModal from './CancelPollConfirmationModal'
import { ConnectWalletModal } from './ConnectWalletModal'

const MODAL_SCHEMAS = {
	[ModalType.NONE]: z.undefined(),
	[ModalType.CONNECT_WALLET]: z.undefined(),
	[ModalType.CANCEL_POLL_CONFIRMATION]: z.object({
		pollId: z.string(),
		pollName: z.string()
	})
}

function isValidModalProps<T extends ModalType>(
	modalType: T,
	modalProps: unknown
): modalProps is ModalProps[T] {
	const schema = MODAL_SCHEMAS[modalType]
	const result = schema.safeParse(modalProps)
	return result.success
}

export default function ModalManager() {
	const { modalType, modalProps } = useAppSelector(selectModal)

	if (!isValidModalProps(modalType, modalProps)) {
		console.error(`Invalid modal props for modal type: ${modalType}. Props: ${modalProps}`)
		return null
	}

	switch (modalType) {
		case ModalType.CONNECT_WALLET:
			return <ConnectWalletModal />

		case ModalType.CANCEL_POLL_CONFIRMATION:
			return <CancelPollConfirmationModal />

		case ModalType.NONE:
		default:
			return null
	}
}
