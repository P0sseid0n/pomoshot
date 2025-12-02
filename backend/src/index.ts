import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { GoogleGenAI, type Part, Type } from '@google/genai'
import { openapi } from '@elysiajs/openapi'
import { Value } from '@sinclair/typebox/value'

const ai = new GoogleGenAI({})

const fileToBase64 = async (file: File) => (await file.bytes()).toBase64()

const ExtractedLessonSchema = t.Object({
	totalMinutes: t.Number(),
	title: t.String(),
	lessons: t.Array(t.String()),
})

const ErrorResponseSchema = t.Object({
	error: t.String(),
	details: t.String(),
})

export const App = new Elysia()
	.use(cors())
	.use(openapi())
	.post(
		'/lessons/extract',
		async ({ body, status }) => {
			console.log(`🚀 ${body.images.length} Arquivos recebidos`)

			const parts: Part[] = await Promise.all(
				body.images.map(async file => ({
					inlineData: {
						mimeType: file.type,
						data: await fileToBase64(file),
					},
				}))
			)

			console.log('Env', Bun.env.GEMINI_API_KEY)

			parts.push({
				text: `Analise estas capturas de tela de materiais de estudo (slides, notas, etc).
               Estime quanto tempo (em minutos) um estudante levaria para estudar esse material profundamente.
               Identifique o assunto principal e uma lista simplificada dos tópicos cobertos.
               Seja realista na estimativa de tempo.`,
			})

			try {
				console.log('🤖 Gerando resposta do modelo...')
				const response = await ai.models.generateContent({
					model: 'gemini-2.5-flash',
					contents: {
						parts,
					},
					config: {
						responseMimeType: 'application/json',
						responseJsonSchema: {
							type: Type.OBJECT,
							properties: {
								totalMinutes: { type: Type.NUMBER, description: 'Tempo total estimado em minutos' },
								title: { type: Type.STRING, description: 'O título ou matéria principal do conteúdo' },
								lessons: {
									type: Type.ARRAY,
									items: { type: Type.STRING },
									description: 'Lista de tópicos principais ou titulos das aulas',
								},
							},
							required: ['totalMinutes', 'title', 'lessons'],
						},
					},
				})
				console.log('✅ Resposta recebida do modelo.')

				if (!response.text) {
					console.log('❌ Resposta do modelo não contém texto')
					throw new Error('Resposta do modelo não contém texto')
				}

				const json = JSON.parse(response.text)

				if (!Value.Check(ExtractedLessonSchema, json)) {
					console.log('❌ Resposta inválida da IA')
					throw new Error('Resposta inválida da IA')
				}

				const parsed = Value.Cast(ExtractedLessonSchema, json)
				console.log('✅ Resposta validada e convertida.')

				return status(200, parsed)
			} catch (error) {
				console.error('Erro ao gerar conteúdo:', error)
				return status(500, { error: 'Erro ao processar os arquivos', details: String(error) })
			}
		},
		{
			body: t.Object({
				images: t.Files(),
			}),
			responses: {
				200: ExtractedLessonSchema,
				500: ErrorResponseSchema,
			},
		}
	)
	.listen(3000, server => {
		console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`)
	})

export type App = typeof App
