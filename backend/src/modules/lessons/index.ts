import { Type, type Part } from '@google/genai'
import { Value } from '@sinclair/typebox/value'
import { Elysia } from 'elysia'
import { ip as ipPlugin } from 'elysia-ip'

import { ResponseError } from '../../errors/ResponseError'
import { gemini } from '../../lib/gemini'
import { setCachedPomo } from '../../services/redis'
import type { LessonExtractResponse } from '../../types'
import { fileToBase64 } from '../../utils'
import * as Model from './model'

export const LessonRoutes = new Elysia({ prefix: '/lessons' }).use(ipPlugin({ headersOnly: true })).post(
	'/extract',
	async ({ body, status, ip }) => {
		console.log(`🚀 ${body.images.length} Arquivos recebidos`)

		const parts: Part[] = await Promise.all(
			body.images.map(async file => ({
				inlineData: {
					mimeType: file.type,
					data: await fileToBase64(file),
				},
			})),
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

			let parsed: LessonExtractResponse
			try {
				parsed = Value.Parse(Model.LessonExtractResponse, json)
				console.log('✅ Resposta validada.')
			} catch {
				console.log('❌ Resposta inválida da IA')
				throw new ResponseError({ error: 'Resposta inválida da IA' })
			}

			await setCachedPomo(ip || '127.0.0.1', { ...parsed, cachedAt: Date.now(), lastLesson: null })

			return status(200, parsed)
		} catch (error) {
			if (error instanceof ResponseError) throw error.toResponse()

			console.error('Erro ao gerar conteúdo:', error)
			throw new ResponseError({ error: 'Erro ao processar os arquivos', details: String(error), statusCode: 500 }).toResponse()
		}
	},
	{
		body: Model.LessonExtractBody,
	},
)
