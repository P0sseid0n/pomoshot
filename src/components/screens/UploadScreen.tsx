import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import Logo from '../ui/Logo'
import UploadIcon from '../icons/Upload'
import services from '../../services'

export default function UploadScreen({
	onNextStage,
	onBackStage,
}: {
	onNextStage: (files: File[]) => void
	onBackStage?: () => void
}) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [files, setFiles] = useState<File[]>([])
	const [filePreviews, setFilePreviews] = useState<string[]>([])
	const [isDragging, setIsDragging] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)

	const [error, setError] = useState<string>()

	const processFiles = (selectedFiles: File[]) => {
		setFiles(prev => [...prev, ...selectedFiles])
		const selectedPreviews = selectedFiles.map(file => URL.createObjectURL(file))
		setFilePreviews(prev => [...prev, ...selectedPreviews])
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

		setFilePreviews(prev => {
			URL.revokeObjectURL(prev[index])
			return prev.filter((_, i) => i !== index)
		})
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))

			if (droppedFiles.length > 0) processFiles(droppedFiles)
			// else setError('apenas arquivos de imagem são permitidos.')
		}
	}

	const handleImportLessons = async () => {
		if (files.length === 0) return

		try {
			setIsProcessing(true)
			const lessons = await services.extractLessons(files)
			onNextStage(lessons.data)
		} catch (error) {
			console.error('Erro ao importar aulas:', error)
			setError('Erro ao importar aulas. Tente novamente.')
		} finally {
			setIsProcessing(false)
		}
	}

	useEffect(() => {
		return () => {
			filePreviews.forEach(url => URL.revokeObjectURL(url))
		}
	}, [filePreviews])
	return (
		<div className="flex flex-col items-center justify-between w-full h-full p-6 space-y-8">
			<header className="flex flex-row justify-between w-full">
				<Logo className="text-xl" />

				<div>{/* Perfil */}</div>
			</header>

			<main className="flex flex-col items-center w-xl">
				<div className="w-full max-w-md text-center mb-8">
					<h2 className="text-2xl font-medium text-neutral-900 mb-2">envie suas capturas</h2>
					<p className="text-neutral-500 text-sm">adicione prints dos slides ou material.</p>
				</div>

				<div
					className={`w-full max-w-md border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group mb-8 h-40 relative overflow-hidden ${
						isDragging
							? 'border-orange-500 bg-orange-50 scale-105 shadow-lg'
							: 'border-neutral-200 hover:border-orange-300 bg-white'
					}`}
					onClick={() => fileInputRef.current?.click()}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<input
						type="file"
						multiple
						accept="image/*"
						className="hidden"
						ref={fileInputRef}
						onChange={handleFileChange}
						aria-label="Enviar capturas de slides"
						title="Enviar capturas de slides"
					/>

					<div
						className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
							isDragging ? 'bg-orange-100 text-orange-600' : 'bg-neutral-50 text-neutral-400 group-hover:text-orange-500'
						}`}
					>
						<UploadIcon />
					</div>
					<p className={`font-medium transition-colors ${isDragging ? 'text-orange-700' : 'text-neutral-600'}`}>
						{isDragging ? 'solte para adicionar' : 'clique ou arraste'}
					</p>
				</div>

				{filePreviews.length > 0 && (
					<div className="flex flex-row flex-wrap gap-4 justify-center mb-4">
						{filePreviews.map((preview, index) => (
							<div className="aspect-video max-h-24 rounded-xl overflow-hidden relative group" key={index}>
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
								<button
									type="button"
									title="Remover imagem"
									onClick={() => handleRemoveFile(index)}
									className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-neutral-500 hover:text-red-500 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<line x1="18" y1="6" x2="6" y2="18"></line>
										<line x1="6" y1="6" x2="18" y2="18"></line>
									</svg>
								</button>

								<img key={index} src={preview} alt={`Preview ${index + 1}`} className="object-cover size-full" />
							</div>
						))}
					</div>
				)}

				{error && <p className="text-red-500 text-sm mt-4 text-center bg-red-50 p-3 rounded-lg w-full max-w-md">{error}</p>}

				<div className="flex flex-row gap-8 mt-4">
					<Button variant="ghost" onClick={onBackStage}>
						voltar
					</Button>
					<Button variant="primary" onClick={handleImportLessons} disabled={files.length === 0} isLoading={isProcessing}>
						importar aulas
					</Button>
				</div>
			</main>

			<footer>
				<p className="text-neutral-400 text-md space-x-1">
					<span>made by</span>
					<a href="" className="font-medium">
						P0sseid0n
					</a>
				</p>
			</footer>
		</div>
	)
}
