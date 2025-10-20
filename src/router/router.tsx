import { createBrowserRouter } from 'react-router'

import { AppLayout } from '@/components/layouts'
import { CLIVotingPage, CreatePollPageLazy, HomePage, NotFoundPage } from '@/pages'

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
				path: PublicRoutes.CLI_VOTING,
				element: <CLIVotingPage />
			},
			{
				path: PublicRoutes.NOT_FOUND,
				element: <NotFoundPage />
			}
		]
	}
])

export default router
