import { describe, it, expect, vi } from 'vitest'
import { openDb } from './db.js'
import { createSizeService } from './sizeService.js'

function makeService(sender = vi.fn()) {
  return { service: createSizeService(openDb(':memory:'), sender), sender }
}

describe('createSizeService', () => {
  it('submitSize returns known:false when recipient has not submitted', async () => {
    const { service } = makeService()
    const result = await service.submitSize('Alice', 'S', 'Bob')
    expect(result).toEqual({ known: false })
  })

  it('submitSize returns known:true with size when recipient has submitted', async () => {
    const { service } = makeService()
    await service.submitSize('Bob', 'XL', 'Alice')
    const result = await service.submitSize('Alice', 'S', 'Bob')
    expect(result).toEqual({ known: true, size: 'XL' })
  })

  it('sends email to pending givers when their recipient submits', async () => {
    const { service, sender } = makeService()
    await service.submitSize('Alice', 'S', 'Bob')
    await service.subscribeNotification('Alice', 'alice@x.com', 'Bob')
    await service.submitSize('Bob', 'XL', 'Charlie')
    expect(sender).toHaveBeenCalledWith('alice@x.com', 'Bob', 'XL')
  })

  it('subscribeNotification returns alreadyKnown when recipient already submitted', async () => {
    const { service } = makeService()
    await service.submitSize('Bob', 'XL', 'Alice')
    await service.submitSize('Alice', 'S', 'Bob')
    const result = await service.subscribeNotification('Alice', 'alice@x.com', 'Bob')
    expect(result).toEqual({ alreadyKnown: true, size: 'XL' })
  })

  it('subscribeNotification returns subscribed:true when recipient size unknown', async () => {
    const { service } = makeService()
    await service.submitSize('Alice', 'S', 'Bob')
    const result = await service.subscribeNotification('Alice', 'alice@x.com', 'Bob')
    expect(result).toEqual({ subscribed: true })
  })

  it('getSize returns null for unknown participant', async () => {
    const { service } = makeService()
    expect(service.getSize('Unknown')).toBeNull()
  })

  it('getSize returns size after submitSize', async () => {
    const { service } = makeService()
    await service.submitSize('Alice', 'M', 'Bob')
    expect(service.getSize('Alice')).toBe('M')
  })
})
