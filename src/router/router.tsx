import { createBrowserRouter } from 'react-router'

import { AppLayout } from '@/components/layouts'
import { CreatePollPageLazy, HomePage, NotFoundPage } from '@/pages'

import { PublicRoutes } from './routes'

const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
	{
		element: <AppLayout />,
		children: [
			{
				path: PublicRoutes.HOME,
				element: <HomePage />
			},
			{
				path: PublicRoutes.CREATE_POLL,
				element: <CreatePollPageLazy />
			},
			{
				path: PublicRoutes.NOT_FOUND,
				element: <NotFoundPage />
			}
		]
	}
])

export default router
