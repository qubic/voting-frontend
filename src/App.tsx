import { I18nextProvider } from 'react-i18next'
import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from 'react-router'

import { ModalManager } from '@/components/modals'
import { Toaster } from '@/components/ui/sonner'
import { WalletConnectProvider } from '@/contexts'
import { router } from '@/router'
import { store } from '@/store'

import i18n from './configs/i18n'

export default function App() {
	return (
		<I18nextProvider i18n={i18n}>
			<ReduxProvider store={store}>
				<Toaster position="bottom-right" />
				<WalletConnectProvider>
					<RouterProvider router={router} />
					<ModalManager />
				</WalletConnectProvider>
			</ReduxProvider>
		</I18nextProvider>
	)
}
