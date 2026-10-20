import { useEffect, useRef, useState } from 'react'

import type { ShareLink } from '../../hooks/useShareLink'
import type { LessonData, PomodoroSession } from '../../types'
import { formatMinutes } from '../../utils'
import { formatDays, SHARE_TTL_DAYS } from '../../utils/share'
import CheckIcon from '../icons/Check'
import ClockIcon from '../icons/Clock'
import { CloseIcon } from '../icons/Close'
import CopyIcon from '../icons/Copy'
import Loading from '../icons/Loading'

export default function ShareDialog({
	open,
	onClose,
	onRetry,
	link,
	lessonData,
	focoDuration,
	breakDuration,
	sessions,
}: {
	open: boolean
	onClose: () => void
	onRetry: () => void
	link?: ShareLink
	lessonData: LessonData
	focoDuration: number
	breakDuration: number
	sessions: PomodoroSession[]
}) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const [copiedUrl, setCopiedUrl] = useState<string>()

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		if (open && !dialog.open) dialog.showModal()
		if (!open && dialog.open) dialog.close()
	}, [open])

	const url = link?.status === 'ready' ? link.url : undefined
	const copied = url !== undefined && copiedUrl === url
	const expiresInDays = link?.status === 'ready' ? link.expiresInDays : SHARE_TTL_DAYS
	const totalWallTime = sessions.reduce((acc, s) => acc + s.duration, 0)

	const handleCopy = async () => {
		if (!url) return

		try {
			await navigator.clipboard.writeText(url)
			setCopiedUrl(url)
		} catch {
			// sem permissão para a área de transferência: seleciona o link para copiar à mão
			inputRef.current?.select()
		}
	}

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="share-title"
			onClose={onClose}
			onClick={e => {
				if (e.target === e.currentTarget) onClose()
			}}
			className="m-auto w-[calc(100%-2rem)] max-w-110 p-0 rounded-[28px] bg-surface text-ink shadow-[0_1px_2px_rgb(var(--shadow)/0.06),0_32px_64px_-24px_rgb(var(--shadow)/0.35)] backdrop:bg-[rgb(var(--shadow)/0.32)] open:animate-rise"
		>
			<div className="p-6 md:p-7">
				<div className="flex items-center justify-between gap-4">
					<h2 id="share-title" className="text-lg font-semibold tracking-[-0.01em]">
						compartilhar plano
					</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Fechar"
						className="size-11 -m-2.5 rounded-full flex items-center justify-center text-ink-muted cursor-pointer transition-colors hover:text-ink hover:bg-sunken"
					>
						<CloseIcon />
					</button>
				</div>
				<p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
					quem abrir o link começa esta mesma sessão, sem precisar enviar as capturas.
				</p>

				<div className="mt-5 p-4 rounded-2xl bg-paper ring-1 ring-line">
					<p className="text-[0.9375rem] font-medium">{lessonData.title.toLowerCase()}</p>
					<p className="mt-1.5 font-mono text-xs text-ink-muted">
						{lessonData.lessons.length} {lessonData.lessons.length === 1 ? 'tópico' : 'tópicos'} · {focoDuration} min foco ·{' '}
						{breakDuration} min pausa · {formatMinutes(totalWallTime)}
					</p>
					<div aria-hidden className="flex gap-[3px] h-1.5 mt-3">
						{sessions.map(session => (
							<span
								key={session.id}
								style={{ flexGrow: session.duration }}
								className={`basis-0 rounded-[3px] ${session.type === 'focus' ? 'bg-ink' : 'bg-accent'}`}
							/>
						))}
					</div>
				</div>

				<label htmlFor="share-link" className="block mt-5 mb-2.5 text-sm font-medium text-ink-muted">
					link
				</label>
				<div className="flex items-center gap-1 p-1 rounded-2xl bg-sunken ring-ink-faint transition-shadow focus-within:ring-1">
					<input
						ref={inputRef}
						id="share-link"
						type="text"
						readOnly
						value={url ? url.replace(/^https?:\/\//, '') : ''}
						placeholder={link?.status === 'loading' ? 'criando link…' : ''}
						onFocus={e => e.currentTarget.select()}
						className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-transparent font-mono text-sm text-ink placeholder:text-ink-faint selection:bg-ink-faint/40 selection:text-ink focus-visible:outline-none"
					/>
					<button
						type="button"
						onClick={handleCopy}
						disabled={!url}
						className={`shrink-0 h-10 px-4 rounded-xl flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-[background-color,color,box-shadow,scale] duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
							copied ? 'bg-surface text-ink ring-1 ring-line' : 'bg-ink text-paper'
						}`}
					>
						{link?.status === 'loading' ? <Loading /> : copied ? <CheckIcon /> : <CopyIcon />}
						{copied ? 'copiado' : 'copiar'}
					</button>
				</div>
				<p className="sr-only" aria-live="polite">
					{copied ? 'link copiado' : ''}
				</p>

				{link?.status === 'error' ? (
					<div
						role="alert"
						className="mt-4 flex gap-2.5 items-start text-sm text-accent-ink bg-accent-soft px-4 py-3 rounded-2xl"
					>
						<span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
						<p className="flex-1">
							{link.message}{' '}
							<button
								type="button"
								onClick={onRetry}
								className="font-medium underline underline-offset-4 cursor-pointer hover:text-ink"
							>
								tentar de novo
							</button>
						</p>
					</div>
				) : (
					<p className="mt-3.5 flex gap-2 items-start text-[0.8125rem] leading-relaxed text-ink-muted">
						<span className="mt-0.5 shrink-0">
							<ClockIcon />
						</span>
						o link expira em {formatDays(expiresInDays)}. só o plano é compartilhado, nunca as suas capturas.
					</p>
				)}
			</div>
		</dialog>
	)
}
