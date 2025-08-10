import { Check, Copy } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type CopyButtonProps = {
	text: string
	children?: React.ReactNode
	tooltipText?: string
	className?: string
}

export default function CopyButton({ children, text, tooltipText, className }: CopyButtonProps) {
	const [isCopied, setIsCopied] = useState(false)

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(text)
		setIsCopied(true)

		setTimeout(() => setIsCopied(false), 2000) // Reset copied state after 2s
	}, [text])

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						onClick={handleCopy}
						className={className}
					>
						{isCopied ? (
							<>
								{children && <span className="text-xs">Copied</span>}
								<Check className="size-4 text-green-500" />
							</>
						) : (
							<>
								{children && <span>{children}</span>}
								<Copy className="text-muted-foreground size-4" />
							</>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{isCopied ? 'Copied!' : tooltipText || 'Copy'}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
