// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RevealView from './RevealView'
import { encode } from '../lib/linkCodec'

afterEach(cleanup)

function renderWithRoute(hash: string) {
  render(
    <MemoryRouter initialEntries={[`/${hash}`]}>
      <RevealView />
    </MemoryRouter>
  )
}

describe('RevealView', () => {
  it('displays recipient name for valid link', () => {
    const encoded = encode({ giver: 'Alice', recipient: 'Bob' })
    renderWithRoute(`?r=${encoded}`)
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows error for invalid link', () => {
    renderWithRoute('?r=garbage')
    expect(screen.getByText('Invalid link')).toBeInTheDocument()
  })

  it('shows error when param missing', () => {
    renderWithRoute('')
    expect(screen.getByText('Invalid link')).toBeInTheDocument()
  })
})
