'use client'

import { FileText, Plus, Trash2, Zap } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { SelectGroup, Separator } from '@radix-ui/react-select'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { useWalletConnect } from '@/hooks'
import { LogFeature, makeLog } from '@/lib/logger'
import { POLL_TYPE } from '@/lib/qubic'
import { QUTIL_CONFIG, QUTIL_PROCEDURES } from '@/lib/qubic/constants'
import { encodeCreatePollFormToBase64 } from '@/lib/qubic/encoders'
import { type CreatePollFormData, CreatePollSchema } from '@/lib/qubic/schemas'
import { useLazyGetTickInfoQuery } from '@/store/apis/qubic-rpc/qubic-rpc.api'

const log = makeLog(LogFeature.CREATE_POLL_FORM)

const POLL_TYPES = [
	{
		label: 'Qubic',
		value: POLL_TYPE.QUBIC
	},
	{
		label: 'Asset',
		value: POLL_TYPE.ASSET
	}
]

export default function CreatePollForm() {
	const { isWalletConnected, selectedAccount, walletClient, handleConnectWallet } =
		useWalletConnect()

	const [getTickInfo] = useLazyGetTickInfoQuery()

	const form = useForm<CreatePollFormData>({
		resolver: zodResolver(CreatePollSchema),
		defaultValues: {
			poll_name: '',
			poll_type: POLL_TYPE.QUBIC,
			min_amount: 1000,
			github_link: '',
			allowed_assets: []
		}
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'allowed_assets'
	})

	const pollType = form.watch('poll_type')

	const handleAddNewAsset = () => {
		append({
			issuer: '',
			assetName: ''
		})
	}

	const onSubmit = async (data: CreatePollFormData) => {
		if (!isWalletConnected || !selectedAccount) {
			alert('Please connect your wallet first')
			return
		}

		if (!walletClient) {
			alert('Wallet client not initialized')
			return
		}

		try {
			const tickInfo = await getTickInfo()

			if (!tickInfo.data) {
				throw new Error('Failed to get tick info')
			}

			const futureTick = tickInfo.data.tick + 10

			log({ formData: data, futureTick })

			const payload = encodeCreatePollFormToBase64(data)

			log({ encodedPayload: payload })

			const sent = await walletClient.sendTransaction(
				selectedAccount.address,
				QUTIL_CONFIG.ADDRESS,
				QUTIL_CONFIG.POLL_CREATION_FEE,
				futureTick,
				QUTIL_PROCEDURES.CREATE_POLL,
				payload
			)

			log({ sent })

			alert(`Poll created at tick ${sent.tick}`)
			form.reset()
		} catch (error) {
			console.error(error)
			alert('Failed to create poll')
		}
	}

	return (
		<Card className="mx-auto md:w-1/2">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					<span>Create New Poll</span>
				</CardTitle>
				<CardDescription>Create a new voting poll for the Qubic community</CardDescription>
				<div className="flex items-center space-x-2 pt-2">
					<Badge
						variant="outline"
						className="bg-warning/10 text-warning border-warning/20"
					>
						<Zap className="mr-1 h-3 w-3" />
						Fee: {QUTIL_CONFIG.POLL_CREATION_FEE.toLocaleString()} QUBIC
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="poll_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Poll Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter poll name" {...field} />
									</FormControl>
									<FormDescription>
										A descriptive name for your poll
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="poll_type"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Poll Type</FormLabel>
									<Select
										value={field.value.toString()}
										onValueChange={(value) => field.onChange(Number(value))}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a token" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectGroup>
												{POLL_TYPES.map((pollType) => (
													<SelectItem
														key={pollType.label}
														value={pollType.value.toString()}
													>
														{pollType.label}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<FormDescription>
										{pollType === POLL_TYPE.QUBIC
											? 'Voting power based on QUBIC balance'
											: 'Voting power based on specified asset holdings'}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="min_amount"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="Enter minimum amount"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Minimum {pollType === POLL_TYPE.QUBIC ? 'QUBIC' : 'asset'}{' '}
										amount required to vote
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="github_link"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>GitHub Link</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="https://github.com/qubic/your-proposal"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Link to the GitHub repository or proposal
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{pollType === POLL_TYPE.ASSET && (
							<div className="space-y-4">
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-medium">Allowed Assets</h3>
										<p className="text-muted-foreground text-sm">
											Specify which assets can be used for voting
										</p>
									</div>
									<Button
										type="button"
										onClick={handleAddNewAsset}
										size="sm"
										variant="outline"
									>
										<Plus className="mr-1 h-4 w-4" />
										Add Asset
									</Button>
								</div>

								{fields.map((field, index) => (
									<Card key={field.id} className="bg-muted/30">
										<CardContent className="pt-4">
											<div className="mb-4 flex items-start justify-between">
												<h4 className="font-medium">Asset {index + 1}</h4>
												<Button
													type="button"
													onClick={() => remove(index)}
													size="sm"
													variant="ghost"
													className="text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
												<FormField
													control={form.control}
													name={`allowed_assets.${index}.issuer`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Issuer Address</FormLabel>
															<FormControl>
																<Input
																	placeholder="Asset issuer address"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name={`allowed_assets.${index}.assetName`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Asset Name</FormLabel>
															<FormControl>
																<Input
																	placeholder="Asset name"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}

						{isWalletConnected ? (
							<Button
								type="submit"
								disabled={form.formState.isSubmitting || !isWalletConnected}
								className="w-full"
							>
								{form.formState.isSubmitting ? 'Creating Poll...' : 'Create Poll'}
							</Button>
						) : (
							<Button type="button" className="w-full" onClick={handleConnectWallet}>
								Connect Wallet
							</Button>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
