import { t } from 'elysia'

export const ResponseErrorBody = t.Object({
	error: t.String({ description: 'Mensagem do erro, pronta para mostrar ao usuário' }),
	code: t.Number({ description: 'Status HTTP' }),
	details: t.Optional(t.String({ description: 'Detalhes técnicos da falha (só em alguns erros 500)' })),
	retryAfter: t.Optional(t.Number({ description: 'Segundos até liberar uma nova extração (só no 429)' })),
})

export class ResponseError extends Error {
	constructor(public errorBody: { error?: string; details?: string; statusCode?: number; retryAfter?: number }) {
		super(errorBody.error)

		this.errorBody.statusCode = errorBody.statusCode ?? 500
	}

	toResponse() {
		return Response.json(
			{
				error: this.message,
				details: this.errorBody.details,
				code: this.errorBody.statusCode,
				retryAfter: this.errorBody.retryAfter,
			},
			{
				status: this.errorBody.statusCode,
				headers: this.errorBody.retryAfter === undefined ? undefined : { 'Retry-After': String(this.errorBody.retryAfter) },
			},
		)
	}
}
