import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'

describe('createApp', () => {
  const app = createApp()

  it('returns health status', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'ok',
      service: 'remunify-api',
    })
  })
})
