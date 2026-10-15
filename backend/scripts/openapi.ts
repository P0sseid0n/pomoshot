// Gera backend/openapi.json a partir do app, sem subir o servidor nem conectar no Redis.
import { App } from '../src/app'

const response = await App.handle(new Request('http://localhost/openapi/json'))
if (!response.ok) throw new Error(`falha ao gerar o schema OpenAPI: ${response.status}`)

const output = new URL('../openapi.json', import.meta.url)
await Bun.write(output, JSON.stringify(await response.json(), null, '\t') + '\n')

console.log(`schema OpenAPI salvo em ${Bun.fileURLToPath(output)}`)
