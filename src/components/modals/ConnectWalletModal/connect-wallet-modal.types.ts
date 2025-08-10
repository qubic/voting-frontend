export const ModalStep = {
	CONNECTION_METHOD_SELECT: 'connection-method-select',
	WC_CONNECT_WALLET: 'wc-connect-wallet',
	WC_ACCOUNT_SELECT: 'wc-account-select'
}
export type ModalStep = (typeof ModalStep)[keyof typeof ModalStep]
