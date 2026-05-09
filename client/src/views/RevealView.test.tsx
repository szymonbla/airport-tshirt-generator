// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RevealView from './RevealView'
import { encode } from '../lib/linkCodec'
import * as api from '../lib/api'

vi.mock('../lib/api', () => ({
  submitSize: vi.fn(),
  fetchRecipientSize: vi.fn(),
  subscribeNotification: vi.fn(),
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.resetAllMocks()
})

beforeEach(() => {
  vi.mocked(api.submitSize).mockResolvedValue({ known: false })
  vi.mocked(api.fetchRecipientSize).mockResolvedValue(null)
  vi.mocked(api.subscribeNotification).mockResolvedValue({ subscribed: true })
})

function renderWithRoute(hash: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/${hash}`]}>
        <RevealView />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('RevealView', () => {
  it('shows error for invalid link', () => {
    renderWithRoute('?r=garbage')
    expect(screen.getByText('Ten link jest dziwny.')).toBeInTheDocument()
  })

  it('shows neutral page when param missing', () => {
    renderWithRoute('')
    expect(screen.getByText('Szmatex')).toBeInTheDocument()
  })

  it('shows size gate on fresh load', () => {
    const encoded = encode({ giver: 'Alice', recipient: 'Bob', tripId: 1 })
    renderWithRoute(`?r=${encoded}`)
    expect(screen.getByText('Rozpakuj walizkę')).toBeInTheDocument()
  })

  it('displays recipient name after size submission', async () => {
    vi.mocked(api.submitSize).mockResolvedValue({ known: false })
    const encoded = encode({ giver: 'Alice', recipient: 'Bob', tripId: 1 })
    renderWithRoute(`?r=${encoded}`)
    fireEvent.click(screen.getByText('GRUBY'))
    fireEvent.click(screen.getByText('Rozpakuj walizkę'))
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument())
  })

  it('shows recipient size when known after submission', async () => {
    vi.mocked(api.submitSize).mockResolvedValue({ known: true, size: 'DUŻY EUROPEJSKI' })
    const encoded = encode({ giver: 'Alice', recipient: 'Bob', tripId: 1 })
    renderWithRoute(`?r=${encoded}`)
    fireEvent.click(screen.getByText('MEGA MAŁY'))
    fireEvent.click(screen.getByText('Rozpakuj walizkę'))
    await waitFor(() => expect(screen.getByText('DUŻY EUROPEJSKI')).toBeInTheDocument())
  })

  it('skips gate when localStorage has previous submission', async () => {
    const encoded = encode({ giver: 'Alice', recipient: 'Bob', tripId: 1 })
    localStorage.setItem(`reveal:${encoded}`, JSON.stringify({ size: 'GRUBY' }))
    vi.mocked(api.fetchRecipientSize).mockResolvedValue('DUŻY EUROPEJSKI')
    renderWithRoute(`?r=${encoded}`)
    await waitFor(() => expect(screen.getByText('DUŻY EUROPEJSKI')).toBeInTheDocument())
  })
})
