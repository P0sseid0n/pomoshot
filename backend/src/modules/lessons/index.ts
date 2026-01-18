import { Elysia } from 'elysia'
import { Value } from '@sinclair/typebox/value'
import { fileToBase64 } from '../../utils'
import { gemini } from '../../lib/gemini'
import * as Model from './model'
import type { Part } from '@google/genai'
import { Type } from '@google/genai'
import { ResponseError } from '../../errors/ResponseError'

export const LessonRoutes = new Elysia({ prefix: '/lessons' }).post(
	'/extract',
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

		parts.push({
			text: `Analise estas capturas de tela de materiais de estudo (slides, notas, etc).
               Estime quanto tempo (em minutos) um estudante levaria para estudar esse material profundamente.
               Identifique o assunto principal e uma lista simplificada dos tópicos cobertos.
               Seja realista na estimativa de tempo.`,
		})

		try {
			console.log('🤖 Gerando resposta do modelo...')
			const response = await gemini.models.generateContent({
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
				throw new ResponseError({ error: 'Resposta do modelo não contém texto' })
			}

			const json = JSON.parse(response.text)

			if (!Value.Check(Model.LessonExtractResponse, json)) {
				console.log('❌ Resposta inválida da IA')
				throw new ResponseError({ error: 'Resposta inválida da IA' })
			}

			const parsed = Value.Cast(Model.LessonExtractResponse, json)
			console.log('✅ Resposta validada e convertida.')

			return status(200, parsed)
		} catch (error) {
			console.error('Erro ao gerar conteúdo:', error)
			throw new ResponseError({ error: 'Erro ao processar os arquivos', details: String(error), statusCode: 500 }).toResponse()
		}
	},
	{
		body: Model.LessonExtractBody,
	}
)
