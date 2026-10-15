export default function Logo({ className = '', onClick }: { className?: string; onClick?: () => void }) {
	const content = (
		<>
			pomoshot
			<span className="text-accent">.</span>
		</>
	)

	const classes = `font-bold tracking-[-0.045em] leading-none select-none ${className}`

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				aria-label="pomoshot, voltar ao início"
				className={`${classes} cursor-pointer rounded-md transition-opacity hover:opacity-70`}
			>
				{content}
			</button>
		)
	}

	return <h1 className={classes}>{content}</h1>
}
