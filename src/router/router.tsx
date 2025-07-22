import { createBrowserRouter } from 'react-router'

import { HomePage, NotFoundPage } from '@/pages'

import { PublicRoutes } from './routes'

const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
	{
		path: PublicRoutes.HOME,
		element: <HomePage />
	},
	{
		path: PublicRoutes.NOT_FOUND,
		element: <NotFoundPage />
	}
])

export default router
