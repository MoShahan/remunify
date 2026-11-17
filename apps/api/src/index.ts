import { config } from 'dotenv'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'

const apiRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
config({ path: resolve(apiRoot, '.env') })

const port = Number(process.env.PORT) || 3001
const app = createApp()

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
