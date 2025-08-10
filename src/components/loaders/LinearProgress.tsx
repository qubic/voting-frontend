export default function LinearProgress() {
	return (
		<div className="w-full">
			<div className="bg-primary-60 h-1.5 w-full overflow-hidden">
				<div className="origin-left-right animate-progress bg-primary-40/30 h-full w-full" />
			</div>
		</div>
	)
}
