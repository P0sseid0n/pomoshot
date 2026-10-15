// Espelho de backend/src/modules/lessons/limits.ts — mantenha os dois em sincronia.
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_IMAGES = 20
export const MAX_IMAGE_SIZE_MB = 10
export const MAX_TOTAL_SIZE_MB = 20

const MB = 1024 * 1024

export const describeImageError = (file: File) => {
	if (!IMAGE_TYPES.includes(file.type)) return `"${file.name}" não é uma imagem suportada (png, jpeg ou webp).`
	if (file.size > MAX_IMAGE_SIZE_MB * MB) return `"${file.name}" passa do limite de ${MAX_IMAGE_SIZE_MB} MB por imagem.`
}

export const describeImagesError = (files: File[]) => {
	if (files.length > MAX_IMAGES) return `envie no máximo ${MAX_IMAGES} imagens.`

	const totalSize = files.reduce((acc, file) => acc + file.size, 0)
	if (totalSize > MAX_TOTAL_SIZE_MB * MB) return `as imagens somam mais de ${MAX_TOTAL_SIZE_MB} MB. remova algumas para continuar.`
}
