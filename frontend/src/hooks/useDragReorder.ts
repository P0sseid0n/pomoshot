import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

interface DragState {
	id: number
	from: number
	over: number
	deltaY: number
	height: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Reordena uma lista vertical arrastando por uma alça, com eventos de ponteiro: funciona com mouse, toque e caneta
 * (o arrastar nativo do HTML não dispara no toque). Enquanto arrasta, as outras linhas abrem espaço para o item.
 */
export const useDragReorder = (items: { id: number }[], onReorder: (from: number, to: number) => void) => {
	const rows = useRef(new Map<number, HTMLElement>())
	// medidas tiradas no início do arraste; ficam fixas até soltar
	const measures = useRef<{ startY: number; mids: number[]; minDelta: number; maxDelta: number }>(undefined)
	const [drag, setDrag] = useState<DragState>()

	const registerRow = (id: number) => (element: HTMLElement | null) => {
		if (element) rows.current.set(id, element)
		else rows.current.delete(id)
	}

	const finish = (commit: boolean) => {
		if (commit && drag && drag.over !== drag.from) onReorder(drag.from, drag.over)
		measures.current = undefined
		setDrag(undefined)
	}

	const handleProps = (id: number) => ({
		onPointerDown: (e: PointerEvent<HTMLElement>) => {
			if (e.button !== 0) return

			const from = items.findIndex(item => item.id === id)
			const rects = items.map(item => rows.current.get(item.id)?.getBoundingClientRect())
			if (from < 0 || rects.some(rect => !rect)) return

			const boxes = rects as DOMRect[]
			e.preventDefault()
			e.currentTarget.setPointerCapture(e.pointerId)

			measures.current = {
				startY: e.clientY,
				mids: boxes.map(box => box.top + box.height / 2),
				minDelta: boxes[0].top - boxes[from].top,
				maxDelta: boxes[boxes.length - 1].bottom - boxes[from].bottom,
			}
			setDrag({ id, from, over: from, deltaY: 0, height: boxes[from].height })
		},
		onPointerMove: (e: PointerEvent<HTMLElement>) => {
			const measure = measures.current
			if (!drag || !measure) return

			const deltaY = clamp(e.clientY - measure.startY, measure.minDelta, measure.maxDelta)
			const center = measure.mids[drag.from] + deltaY

			let over = drag.from
			for (let i = drag.from + 1; i < measure.mids.length; i++) if (center > measure.mids[i]) over = i
			for (let i = drag.from - 1; i >= 0; i--) if (center < measure.mids[i]) over = i

			setDrag({ ...drag, deltaY, over })
		},
		onPointerUp: () => finish(true),
		onPointerCancel: () => finish(false),
	})

	/** Deslocamento de cada linha durante o arraste: a arrastada segue o ponteiro, as do caminho abrem espaço. */
	const rowStyle = (id: number, index: number): CSSProperties | undefined => {
		if (!drag) return
		if (id === drag.id) return { transform: `translateY(${drag.deltaY}px)` }

		let shift = 0
		if (drag.from < drag.over && index > drag.from && index <= drag.over) shift = -drag.height
		if (drag.over < drag.from && index >= drag.over && index < drag.from) shift = drag.height

		return { transform: `translateY(${shift}px)`, transition: 'transform 200ms var(--ease-out-soft)' }
	}

	return { draggingId: drag?.id, registerRow, handleProps, rowStyle }
}
