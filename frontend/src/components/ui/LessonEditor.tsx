import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'

import { useDragReorder } from '../../hooks/useDragReorder'
import { formatMinutes } from '../../utils'
import ArrowDownIcon from '../icons/ArrowDown'
import ArrowUpIcon from '../icons/ArrowUp'
import CheckIcon from '../icons/Check'
import GripIcon from '../icons/Grip'
import MinusIcon from '../icons/Minus'
import MoreIcon from '../icons/More'
import PencilIcon from '../icons/Pencil'
import PlusIcon from '../icons/Plus'
import TrashIcon from '../icons/Trash'

export interface Topic {
	id: number
	label: string
}

const TOTAL_STEP = 5
const TOTAL_MIN = 5
const TOTAL_MAX = 600
// espelho dos limites de SharedPlanBody no backend, para o plano editado continuar compartilhável
const MAX_TOPICS = 100
const MAX_TOPIC_LENGTH = 200

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many)

function IconButton({ className = '', ...props }: ComponentProps<'button'>) {
	return (
		<button
			type="button"
			className={`size-10 sm:size-9 shrink-0 rounded-full flex items-center justify-center text-ink-muted cursor-pointer transition-colors hover:bg-sunken hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-muted ${className}`}
			{...props}
		/>
	)
}

/**
 * Campo do nome do tópico: quebra linha e cresce com o texto, para nomes longos não ficarem escondidos.
 * O nome continua sendo uma linha só: Enter confirma e quebras coladas viram espaço.
 */
function TopicNameField({
	id,
	value,
	onChange,
	onCommit,
	onCancel,
}: {
	id: string
	value: string
	onChange: (value: string) => void
	onCommit: () => void
	onCancel: () => void
}) {
	const ref = useRef<HTMLTextAreaElement>(null)

	// ao abrir, foco com o cursor no fim do nome
	useEffect(() => {
		const field = ref.current
		if (!field) return

		field.focus()
		field.setSelectionRange(field.value.length, field.value.length)
	}, [])

	useLayoutEffect(() => {
		const field = ref.current
		if (!field) return

		field.style.height = 'auto'
		field.style.height = `${field.scrollHeight}px`
	}, [value])

	return (
		<textarea
			ref={ref}
			id={id}
			rows={1}
			value={value}
			maxLength={MAX_TOPIC_LENGTH}
			placeholder="nome do tópico"
			onChange={e => onChange(e.target.value.replace(/\s*\n\s*/g, ' '))}
			onKeyDown={e => {
				if (e.key === 'Enter') {
					e.preventDefault()
					onCommit()
				} else if (e.key === 'Escape') {
					e.preventDefault()
					onCancel()
				}
			}}
			className="flex-1 min-w-0 min-h-10 px-2.5 py-2 rounded-[10px] bg-paper text-ink text-[0.9375rem] leading-6 resize-none overflow-hidden placeholder:text-ink-faint selection:bg-ink-faint/40 selection:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink-faint"
		/>
	)
}

interface MenuAction {
	label: string
	icon: ReactNode
	onSelect: () => void
	disabled?: boolean
}

/** Menu ⋯ com as ações da linha em edição, para o campo do nome ficar com a largura toda. */
function TopicMenu({ label, actions }: { label: string; actions: MenuAction[] }) {
	const [open, setOpen] = useState(false)
	const rootRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

	useEffect(() => {
		if (!open) return

		itemRefs.current.find(item => item && !item.disabled)?.focus()

		const closeOnOutside = (e: PointerEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('pointerdown', closeOnOutside)
		return () => document.removeEventListener('pointerdown', closeOnOutside)
	}, [open])

	const close = (refocus: boolean) => {
		setOpen(false)
		if (refocus) buttonRef.current?.focus()
	}

	const handleMenuKeyDown = (e: React.KeyboardEvent) => {
		const items = itemRefs.current.filter((item): item is HTMLButtonElement => !!item && !item.disabled)
		const current = items.indexOf(document.activeElement as HTMLButtonElement)

		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault()
			const step = e.key === 'ArrowDown' ? 1 : -1
			items[(current + step + items.length) % items.length]?.focus()
		} else if (e.key === 'Escape') {
			e.preventDefault()
			close(true)
		} else if (e.key === 'Tab') {
			close(false)
		}
	}

	return (
		<div ref={rootRef} className="relative shrink-0">
			<IconButton
				ref={buttonRef}
				onClick={() => setOpen(prev => !prev)}
				aria-label={label}
				aria-haspopup="menu"
				aria-expanded={open}
				className={open ? 'bg-sunken text-ink' : ''}
			>
				<MoreIcon />
			</IconButton>

			{open && (
				<div
					role="menu"
					aria-label={label}
					onKeyDown={handleMenuKeyDown}
					className="absolute right-0 top-full mt-1.5 z-20 min-w-48 p-1.5 rounded-2xl bg-surface ring-1 ring-line shadow-[0_1px_2px_rgb(var(--shadow)/0.06),0_16px_32px_-12px_rgb(var(--shadow)/0.3)] animate-rise [animation-duration:200ms]"
				>
					{actions.map((action, i) => (
						<button
							key={action.label}
							ref={el => {
								itemRefs.current[i] = el
							}}
							type="button"
							role="menuitem"
							disabled={action.disabled}
							onClick={() => {
								action.onSelect()
								close(true)
							}}
							className="w-full h-10 px-3 rounded-xl flex items-center gap-2.5 text-sm text-ink text-left cursor-pointer transition-colors hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent"
						>
							<span className="text-ink-muted">{action.icon}</span>
							{action.label}
						</button>
					))}
				</div>
			)}
		</div>
	)
}

export default function LessonEditor({
	title,
	topics,
	onTopicsChange,
	totalMinutes,
	onTotalMinutesChange,
}: {
	title: string
	topics: Topic[]
	onTopicsChange: (topics: Topic[]) => void
	totalMinutes: number
	onTotalMinutesChange: (totalMinutes: number) => void
}) {
	// tópico aberto para edição e o nome que ele tinha ao abrir, para o esc desfazer
	const [editing, setEditing] = useState<{ id: number; original: string; isNew: boolean }>()
	const [isEditingTotal, setIsEditingTotal] = useState(false)

	const topicWord = plural(topics.length, 'tópico', 'tópicos')

	/** Fecha a edição aberta: um nome vazio volta ao original, ou o tópico some se acabou de ser criado. */
	const settleEditing = (list: Topic[]) => {
		const current = editing && list.find(topic => topic.id === editing.id)
		if (!editing || !current || current.label.trim()) return list

		return editing.isNew
			? list.filter(topic => topic.id !== editing.id)
			: list.map(topic => (topic.id === editing.id ? { ...topic, label: editing.original } : topic))
	}

	const startEditing = (topic: Topic) => {
		onTopicsChange(settleEditing(topics))
		setEditing({ id: topic.id, original: topic.label, isNew: false })
		setIsEditingTotal(false)
	}

	const commit = () => {
		onTopicsChange(settleEditing(topics))
		setEditing(undefined)
	}

	const cancel = () => {
		if (!editing) return

		onTopicsChange(
			editing.isNew
				? topics.filter(topic => topic.id !== editing.id)
				: topics.map(topic => (topic.id === editing.id ? { ...topic, label: editing.original } : topic)),
		)
		setEditing(undefined)
	}

	const add = () => {
		const base = settleEditing(topics)
		const id = Math.max(-1, ...topics.map(topic => topic.id)) + 1

		onTopicsChange([...base, { id, label: '' }])
		setEditing({ id, original: '', isNew: true })
		setIsEditingTotal(false)
	}

	const rename = (id: number, label: string) => onTopicsChange(topics.map(topic => (topic.id === id ? { ...topic, label } : topic)))

	const moveTo = (from: number, to: number) => {
		if (to < 0 || to >= topics.length || to === from) return

		const next = [...topics]
		const [topic] = next.splice(from, 1)
		next.splice(to, 0, topic)
		onTopicsChange(next)
	}

	const move = (index: number, delta: number) => moveTo(index, index + delta)

	const { draggingId, registerRow, handleProps, rowStyle } = useDragReorder(topics, moveTo)

	const remove = (id: number) => {
		onTopicsChange(topics.filter(topic => topic.id !== id))
		setEditing(undefined)
	}

	const editTotal = () => {
		commit()
		setIsEditingTotal(true)
	}

	const changeTotal = (delta: number) => onTotalMinutesChange(Math.min(TOTAL_MAX, Math.max(TOTAL_MIN, totalMinutes + delta)))

	return (
		<section aria-labelledby="lesson-title" className="animate-rise">
			<p className="text-sm font-medium text-accent mb-3">assunto identificado</p>
			<h2 id="lesson-title" className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">
				{title.toLowerCase()}
			</h2>

			{isEditingTotal ? (
				<div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
					<div
						role="group"
						aria-label="tempo de aula"
						className="inline-flex items-center p-1 rounded-full bg-surface ring-1 ring-line"
					>
						<IconButton
							onClick={() => changeTotal(-TOTAL_STEP)}
							disabled={totalMinutes <= TOTAL_MIN}
							aria-label={`diminuir ${TOTAL_STEP} minutos`}
							className="size-8! sm:size-8!"
						>
							<MinusIcon />
						</IconButton>
						<output aria-live="polite" className="min-w-19 text-center font-mono text-[0.9375rem] font-medium">
							{formatMinutes(totalMinutes)}
						</output>
						<IconButton
							onClick={() => changeTotal(TOTAL_STEP)}
							disabled={totalMinutes >= TOTAL_MAX}
							aria-label={`aumentar ${TOTAL_STEP} minutos`}
							className="size-8! sm:size-8!"
						>
							<PlusIcon />
						</IconButton>
					</div>
					<span className="text-ink-muted">
						de aula em <span className="font-mono text-ink">{topics.length}</span> {topicWord}
					</span>
					<button
						type="button"
						onClick={() => setIsEditingTotal(false)}
						aria-label="concluir tempo de aula"
						className="size-8 rounded-full flex items-center justify-center bg-ink text-paper cursor-pointer transition-transform active:scale-95"
					>
						<CheckIcon />
					</button>
				</div>
			) : (
				<p className="mt-4 text-ink-muted">
					<button
						type="button"
						onClick={editTotal}
						aria-label={`editar tempo de aula, ${formatMinutes(totalMinutes)}`}
						className="font-mono text-ink underline decoration-dotted decoration-ink-faint underline-offset-4 rounded-sm cursor-pointer transition-colors hover:decoration-ink-muted"
					>
						{formatMinutes(totalMinutes)}
					</button>{' '}
					de aula em <span className="font-mono text-ink">{topics.length}</span> {topicWord}
				</p>
			)}

			<ol aria-label="tópicos" className="mt-8 border-t border-line">
				{topics.map((topic, idx) => {
					const number = String(idx + 1).padStart(2, '0')
					const display = topic.label.trim() ? topic.label.toLowerCase() : 'tópico sem nome'

					return (
						<li
							key={topic.id}
							ref={registerRow(topic.id)}
							style={rowStyle(topic.id, idx)}
							className={`border-b border-line ${draggingId === topic.id ? 'relative z-10' : ''}`}
						>
							{editing?.id === topic.id ? (
								<div
									className={`-mx-2.5 my-1.5 p-1.5 rounded-2xl flex items-start gap-0.5 bg-surface ring-1 ring-line transition-shadow ${
										draggingId === topic.id
											? 'shadow-[0_1px_2px_rgb(var(--shadow)/0.06),0_20px_40px_-16px_rgb(var(--shadow)/0.4)]'
											: 'shadow-[0_12px_24px_-16px_rgb(var(--shadow)/0.25)]'
									}`}
								>
									<button
										type="button"
										aria-label={`arrastar ${display} para reordenar`}
										title="arraste, ou use as setas do teclado"
										{...handleProps(topic.id)}
										onKeyDown={e => {
											if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
											e.preventDefault()
											move(idx, e.key === 'ArrowUp' ? -1 : 1)
										}}
										className={`w-6 h-10 shrink-0 rounded-lg flex items-center justify-center text-ink-faint touch-none select-none transition-colors hover:text-ink-muted ${
											draggingId === topic.id ? 'cursor-grabbing' : 'cursor-grab'
										}`}
									>
										<GripIcon />
									</button>
									<label htmlFor={`topic-${topic.id}`} className="sr-only">
										nome do tópico {number}
									</label>
									<TopicNameField
										id={`topic-${topic.id}`}
										value={topic.label}
										onChange={label => rename(topic.id, label)}
										onCommit={commit}
										onCancel={cancel}
									/>
									<TopicMenu
										label={`mais ações para ${display}`}
										actions={[
											{
												label: 'mover para cima',
												icon: <ArrowUpIcon />,
												onSelect: () => move(idx, -1),
												disabled: idx === 0,
											},
											{
												label: 'mover para baixo',
												icon: <ArrowDownIcon />,
												onSelect: () => move(idx, 1),
												disabled: idx === topics.length - 1,
											},
											{
												label: 'remover',
												icon: <TrashIcon />,
												onSelect: () => remove(topic.id),
												disabled: topics.length <= 1,
											},
										]}
									/>
									<button
										type="button"
										onClick={commit}
										aria-label={`concluir edição de ${display}`}
										className="size-10 sm:size-9 ml-0.5 shrink-0 rounded-full flex items-center justify-center bg-ink text-paper cursor-pointer transition-transform active:scale-95"
									>
										<CheckIcon />
									</button>
								</div>
							) : (
								<button
									type="button"
									onClick={() => startEditing(topic)}
									aria-label={`editar ${display}`}
									className="group w-full flex items-center gap-4 py-3 text-left text-[0.9375rem] rounded-sm cursor-pointer"
								>
									<span className="font-mono text-xs text-ink-faint w-5 shrink-0">{number}</span>
									<span className={`flex-1 min-w-0 ${topic.label.trim() ? 'text-ink' : 'text-ink-faint'}`}>
										{display}
									</span>
									<span className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
										<PencilIcon />
									</span>
								</button>
							)}
						</li>
					)
				})}
			</ol>

			<div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
				<button
					type="button"
					onClick={add}
					disabled={topics.length >= MAX_TOPICS}
					className="h-9 -ml-2.5 px-3 rounded-full inline-flex items-center gap-1.5 text-sm text-ink-muted cursor-pointer transition-colors hover:text-ink hover:bg-sunken disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<PlusIcon />
					adicionar tópico
				</button>
				<span className="text-xs text-ink-faint">
					<span className="[@media(hover:none)]:hidden">clique</span>
					<span className="hidden [@media(hover:none)]:inline">toque</span> em um tópico para editar
				</span>
			</div>
		</section>
	)
}
