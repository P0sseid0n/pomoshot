// Espelhado em frontend/src/utils/images.ts — mantenha os dois em sincronia.
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_IMAGES = 20
export const MAX_IMAGE_SIZE_MB = 10
// O Gemini limita o tamanho total dos dados enviados inline em uma requisição.
export const MAX_TOTAL_SIZE_MB = 20

const MB = 1024 * 1024

export const describeImagesError = (images: { name: string; type: string; size: number }[]) => {
	if (images.length === 0) return 'envie pelo menos uma imagem.'
	if (images.length > MAX_IMAGES) return `envie no máximo ${MAX_IMAGES} imagens.`

	const invalidType = images.find(image => !IMAGE_TYPES.includes(image.type))
	if (invalidType) return `"${invalidType.name}" não é uma imagem suportada (png, jpeg ou webp).`

	const tooLarge = images.find(image => image.size > MAX_IMAGE_SIZE_MB * MB)
	if (tooLarge) return `"${tooLarge.name}" passa do limite de ${MAX_IMAGE_SIZE_MB} MB por imagem.`

	const totalSize = images.reduce((acc, image) => acc + image.size, 0)
	if (totalSize > MAX_TOTAL_SIZE_MB * MB)
		return `as imagens somam mais de ${MAX_TOTAL_SIZE_MB} MB. envie menos imagens ou arquivos menores.`
}
