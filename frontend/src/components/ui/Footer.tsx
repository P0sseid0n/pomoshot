export default function Footer() {
	return (
		<footer className="w-full flex justify-center pt-4">
			<p className="text-ink-faint text-sm">
				&copy; {new Date().getFullYear()} pomoshot · feito por{' '}
				<a
					href="https://p0sseid0n.dev/"
					target="_blank"
					rel="noreferrer"
					className="font-medium text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-accent rounded-sm"
				>
					P0sseid0n
				</a>
			</p>
		</footer>
	)
}
