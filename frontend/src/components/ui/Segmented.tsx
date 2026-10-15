export default function Segmented<T extends string | number>({
	label,
	options,
	value,
	onChange,
	format = v => String(v),
}: {
	label: string
	options: T[]
	value: T
	onChange: (value: T) => void
	format?: (value: T) => string
}) {
	return (
		<div role="group" aria-label={label}>
			<p className="text-sm font-medium text-ink-muted mb-2.5">{label}</p>
			<div className="flex p-1 gap-1 rounded-2xl bg-sunken">
				{options.map(option => {
					const selected = option === value
					return (
						<button
							type="button"
							key={option}
							aria-pressed={selected}
							onClick={() => onChange(option)}
							className={`flex-1 h-10 rounded-xl font-mono text-sm cursor-pointer transition-[background-color,color,box-shadow,scale] duration-200 active:scale-[0.97] ${
								selected
									? 'bg-surface text-ink font-medium shadow-[0_1px_2px_rgb(var(--shadow)/0.08),0_2px_8px_-2px_rgb(var(--shadow)/0.1)]'
									: 'text-ink-muted hover:text-ink'
							}`}
						>
							{format(option)}
						</button>
					)
				})}
			</div>
		</div>
	)
}
