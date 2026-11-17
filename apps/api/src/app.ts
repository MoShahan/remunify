import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/error-handler.js'
import { employeesRouter } from './modules/employees/employees.routes.js'
import { salariesRouter } from './modules/salaries/salaries.routes.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'remunify-api' })
  })

  app.use('/api/employees', employeesRouter)
  app.use('/api/employees/:employeeId/salary', salariesRouter)

  app.use(errorHandler)

  return app
}
