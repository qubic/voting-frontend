import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from 'react-router'

import { router } from '@/router'
import { store } from '@/store'

export default function App() {
	return (
		<ReduxProvider store={store}>
			<RouterProvider router={router} />
		</ReduxProvider>
	)
}
