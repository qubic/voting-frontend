import { Clock } from 'lucide-react'

export default function EpochInfo() {
	return (
		<div className="bg-muted rounded-lg p-4">
			<div className="mb-2 flex items-center gap-2">
				<Clock className="h-4 w-4" />
				<span className="font-semibold">Epoch Information</span>
			</div>
			<p className="text-muted-foreground text-sm">
				Polls reset every epoch. Active polls will become inactive at the end of the current
				epoch. Maximum 16 new polls can be created per epoch.
			</p>
		</div>
	)
}
