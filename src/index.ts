import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { GoogleGenAI, Part, Type } from '@google/genai'
import { openapi } from '@elysiajs/openapi'

const ai = new GoogleGenAI({})

const fileToBase64 = async (file: File) => (await file.bytes()).toBase64()

new Elysia()
	.use(cors())
	.use(openapi())
	.post(
		'/lessons/extract',
		async ({ body, status }) => {
			console.log(`🚀 ${body.image.length} Arquivos recebidos`)
			const parts: Part[] = []

			for (const file of body.image) {
				const data = await fileToBase64(file)

				parts.push({
					inlineData: {
						mimeType: file.type,
						data,
					},
				})
			}

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
								subject: { type: Type.STRING, description: 'O título ou matéria principal do conteúdo' },
								topics: {
									type: Type.ARRAY,
									items: { type: Type.STRING },
									description: 'Lista de tópicos principais ou titulos das aulas',
								},
							},
							required: ['totalMinutes', 'subject', 'topics'],
						},
					},
				})

				if (!response.text) {
					throw new Error('Resposta vazia do modelo')
				}

				const parsed = JSON.parse(response.text)

				return status(200, parsed)
			} catch (error) {
				console.error('Erro ao gerar conteúdo:', error)
				return status(500, { error: 'Erro ao processar os arquivos', details: String(error) })
			}
		},
		{
			body: t.Object({
				image: t.Files({ type: 'image' }),
			}),
			response: {
				200: t.Object({
					totalMinutes: t.Number(),
					subject: t.String(),
					topics: t.Array(t.String()),
				}),
				500: t.Object({ error: t.String(), details: t.String() }),
			},
		}
	)
	.listen(3000, server => {
		console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`)
	})
