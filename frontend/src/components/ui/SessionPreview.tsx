import type { PomodoroSession } from '../../types'
import { formatMinutes } from '../../utils'

export default function SessionPreview({ sessions }: { sessions: PomodoroSession[] }) {
	const totalWallTime = sessions.reduce((acc, s) => acc + s.duration, 0)
	const focusCount = sessions.filter(s => s.type === 'focus').length
	const breakCount = sessions.length - focusCount

	return (
		<div>
			<div className="flex items-baseline justify-between mb-3">
				<span className="text-sm font-medium text-ink-muted">sessão</span>
				<span className="font-mono text-2xl font-medium tracking-tight">{formatMinutes(totalWallTime)}</span>
			</div>

			<div
				role="img"
				aria-label={`${focusCount} blocos de foco e ${breakCount} pausas, total de ${totalWallTime} minutos`}
				className="flex gap-[3px] h-2"
			>
				{sessions.map(session => (
					<span
						key={session.id}
						style={{ flexGrow: session.duration }}
						className={`basis-0 rounded-[3px] transition-[flex-grow] duration-500 ease-out-soft ${
							session.type === 'focus' ? 'bg-ink' : 'bg-accent'
						}`}
					/>
				))}
			</div>

			<div className="flex gap-5 mt-3 text-xs text-ink-muted">
				<span className="flex items-center gap-1.5">
					<span className="size-2 rounded-full bg-ink" />
					{focusCount} foco
				</span>
				<span className="flex items-center gap-1.5">
					<span className="size-2 rounded-full bg-accent" />
					{breakCount} {breakCount === 1 ? 'pausa' : 'pausas'}
				</span>
			</div>
		</div>
	)
}
