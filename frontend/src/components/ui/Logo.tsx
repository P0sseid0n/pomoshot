export default function Logo({ className }: { className?: string }) {
	return (
		<h1 className={'font-bold tracking-tighter select-none ' + (className ?? '')}>
			pomoshot
			<span className="text-orange-400">.</span>
		</h1>
	)
}
