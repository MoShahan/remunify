import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders Remunify branding and primary actions', () => {
    render(<App />)

    expect(screen.getByText('Remunify')).toBeInTheDocument()
    expect(
      screen.getByText('Salary management for modern HR teams'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Open directory' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'View dashboard' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Browse employees' }),
    ).toBeInTheDocument()
  })
})
