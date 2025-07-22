import { Link } from 'react-router'

import { PublicRoutes } from '@/router'

export default function NotFoundPage() {
	return (
		<div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
			<h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
			<p className="mb-6 text-lg">Sorry, the page you are looking for does not exist.</p>
			<Link
				to={PublicRoutes.HOME}
				className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-6 py-2 transition"
			>
				Go back home
			</Link>
		</div>
	)
}
