import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('routes unauthenticated users to the login screen', async () => {
    localStorage.clear()
    render(<App />)

    expect(await screen.findByText('Remunify')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })
})
