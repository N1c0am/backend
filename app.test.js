const request = require('supertest')
const app = require('./app')

describe('API Tests', () => {
  it('should respond to health check', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBeDefined()
  })
})