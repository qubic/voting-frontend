import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { PublicRoutes } from '@/router'

import { CreatePollForm } from './components'

export default function CreatePollPage() {
	return (
		<div>
			<div className="mb-4">
				<Button asChild variant="ghost" size="sm" className="gap-2">
					<Link to={PublicRoutes.HOME}>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Link>
				</Button>
			</div>
			<CreatePollForm />
		</div>
	)
}
