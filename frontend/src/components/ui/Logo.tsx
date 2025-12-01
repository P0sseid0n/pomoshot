export default function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
	let classesNames = 'font-bold tracking-tighter select-none '

	if (onClick) classesNames += ' cursor-pointer'
	if (className) classesNames += ' ' + className

	return (
		<h1 onClick={onClick} className={classesNames}>
			pomoshot
			<span className="text-red-500 ml-1">.</span>
		</h1>
	)
}
