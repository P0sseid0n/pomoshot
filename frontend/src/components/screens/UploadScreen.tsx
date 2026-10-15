import type { Treaty } from '@elysiajs/eden'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Client } from '../../api'
import { CloseIcon } from '../icons/Close'
import UploadIcon from '../icons/Upload'
import Button from '../ui/Button'
import Footer from '../ui/Footer'
import Header from '../ui/Header'

export default function UploadScreen({
	onNextStage,
	onBackStage,
	onReset,
}: {
	onNextStage: (data: Treaty.Data<typeof Client.lessons.extract.post>) => void
	onBackStage: () => void
	onReset: () => void
}) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [files, setFiles] = useState<File[]>([])
	const filePreviews = useMemo(() => files.map(file => URL.createObjectURL(file)), [files])
	const [isDragging, setIsDragging] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)

	const [errorDisplay, setErrorDisplay] = useState<string>()

	const processFiles = (selectedFiles: File[]) => {
		setErrorDisplay(undefined)
		setFiles(prev => [...prev, ...selectedFiles])
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			processFiles(Array.from(e.target.files))

			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleRemoveFile = (index: number) => {
		setFiles(prev => prev.filter((_, i) => i !== index))
	}

	const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault()
		setIsDragging(false)

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))

			if (droppedFiles.length > 0) processFiles(droppedFiles)
			else setErrorDisplay('apenas arquivos de imagem são permitidos.')
		}
	}

	const getErrorMessage = (error: unknown): string | undefined => {
		const isObject = (obj: unknown): obj is Record<string, unknown> => typeof obj === 'object' && obj !== null

		if (typeof error === 'string') return error
		if (isObject(error) && 'value' in error) {
			if (typeof error.value === 'string') return error.value
			if (isObject(error.value) && 'error' in error.value) return String(error.value.error)
			if (isObject(error.value) && 'message' in error.value) return String(error.value.message)
		}
		if (error instanceof Error) return error.message
	}

	const handleImportLessons = async () => {
		if (files.length === 0) {
			return setErrorDisplay('adicione pelo menos uma captura de tela para continuar.')
		}

		setErrorDisplay(undefined)
		setIsProcessing(true)

		try {
			const { data, error } = await Client.lessons.extract.post({ images: files })
			if (error) throw error
			onNextStage(data)
		} catch (error) {
			setIsProcessing(false)

			console.error('Erro ao importar aulas:', error)
			setErrorDisplay(getErrorMessage(error) ?? 'ocorreu um erro ao importar as aulas')
		}
	}

	useEffect(() => {
		return () => {
			filePreviews.forEach(url => URL.revokeObjectURL(url))
		}
	}, [filePreviews])

	useEffect(() => {
		const pasteHandler = async (e: ClipboardEvent) => {
			const pastedFiles = Array.from(e.clipboardData?.files || []).filter(f => f.type.startsWith('image/'))

			if (pastedFiles.length > 0) {
				processFiles(pastedFiles)
				e.preventDefault()
			}
		}

		window.addEventListener('paste', pasteHandler)
		return () => window.removeEventListener('paste', pasteHandler)
	}, [])

	return (
		<>
			<Header onReset={onReset} />

			<main className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto py-12 md:py-16">
				<div className="w-full mb-8 animate-rise">
					<h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]">envie suas capturas</h2>
					<p className="mt-2 text-ink-muted max-w-[44ch]">
						prints da lista de aulas ou dos slides, com títulos e durações visíveis.
					</p>
				</div>

				<input
					type="file"
					multiple
					accept="image/*"
					className="hidden"
					ref={fileInputRef}
					onChange={handleFileChange}
					aria-label="Enviar capturas de slides"
					tabIndex={-1}
				/>

				<button
					type="button"
					disabled={isProcessing}
					onClick={() => fileInputRef.current?.click()}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`group w-full h-48 rounded-[28px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-[background-color,box-shadow,scale] duration-300 ease-out-soft animate-rise stagger-1 disabled:cursor-not-allowed disabled:opacity-60 ${
						isDragging
							? 'bg-accent-soft ring-2 ring-accent scale-[1.015]'
							: 'bg-surface ring-1 ring-line hover:ring-ink-faint shadow-[0_1px_2px_rgb(var(--shadow)/0.04),0_12px_32px_-16px_rgb(var(--shadow)/0.15)]'
					}`}
				>
					<span
						className={`size-12 rounded-2xl flex items-center justify-center transition-[background-color,color,translate] duration-300 ease-spring ${
							isDragging
								? 'bg-accent text-paper -translate-y-1'
								: 'bg-sunken text-ink-muted group-hover:text-accent group-hover:-translate-y-0.5'
						}`}
					>
						<UploadIcon />
					</span>
					<span className={`font-medium ${isDragging ? 'text-accent-ink' : 'text-ink'}`}>
						{isDragging ? 'solte para adicionar' : 'clique ou arraste as imagens'}
					</span>
					<span className="text-sm text-ink-faint">
						ou cole com <kbd className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-sunken text-ink-muted">ctrl+v</kbd>
					</span>
				</button>

				{filePreviews.length > 0 && (
					<section aria-label="Imagens selecionadas" className="w-full mt-6">
						<p className="text-sm text-ink-muted mb-3">
							<span className="font-mono text-ink">{files.length}</span> {files.length === 1 ? 'imagem' : 'imagens'}
						</p>
						<ul className="grid grid-cols-3 sm:grid-cols-4 gap-3">
							{filePreviews.map((preview, index) => (
								<li
									key={preview}
									className="aspect-video rounded-xl overflow-hidden relative group ring-1 ring-line animate-rise"
								>
									<img src={preview} alt={`Captura ${index + 1}`} className="object-cover size-full" />
									<button
										type="button"
										aria-label={`Remover captura ${index + 1}`}
										onClick={() => handleRemoveFile(index)}
										disabled={isProcessing}
										className="absolute top-1.5 right-1.5 size-7 rounded-full bg-surface/90 backdrop-blur text-ink-muted hover:text-accent flex items-center justify-center shadow-sm cursor-pointer transition-[opacity,color] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 disabled:pointer-events-none"
									>
										<CloseIcon />
									</button>
								</li>
							))}
						</ul>
					</section>
				)}

				{errorDisplay && (
					<p
						role="alert"
						className="w-full mt-6 flex gap-2.5 items-start text-sm text-accent-ink bg-accent-soft px-4 py-3 rounded-2xl"
					>
						<span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
						{errorDisplay}
					</p>
				)}

				<div className="w-full flex items-center justify-between gap-4 mt-10">
					<Button variant="ghost" onClick={onBackStage} disabled={isProcessing}>
						voltar
					</Button>
					<Button variant="primary" onClick={handleImportLessons} disabled={files.length === 0} isLoading={isProcessing}>
						importar aulas
					</Button>
				</div>
			</main>

			<Footer />
		</>
	)
}
