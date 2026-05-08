import { describe, it, expect, vi } from 'vitest'
import { openTestDb } from './testDb.js'
import { createSizeService } from './sizeService.js'

const T = 1

function makeService(sender = vi.fn()) {
  return { service: createSizeService(openTestDb(), sender), sender }
}

describe('createSizeService', () => {
  it('submitSize returns known:false when recipient has not submitted', async () => {
    const { service } = makeService()
    expect(await service.submitSize(T, 'Alice', 'GRUBY', 'Bob')).toEqual({ known: false })
  })

  it('submitSize returns known:true with size when recipient has submitted', async () => {
    const { service } = makeService()
    await service.submitSize(T, 'Bob', 'GRUBY', 'Alice')
    expect(await service.submitSize(T, 'Alice', 'MEGA MAŁY', 'Bob')).toEqual({ known: true, size: 'GRUBY' })
  })

  it('sends email to pending givers when their recipient submits', async () => {
    const { service, sender } = makeService()
    await service.submitSize(T, 'Alice', 'MEGA MAŁY', 'Bob')
    await service.subscribeNotification(T, 'Alice', 'alice@x.com', 'Bob')
    await service.submitSize(T, 'Bob', 'GRUBY', 'Charlie')
    expect(sender).toHaveBeenCalledWith('alice@x.com', 'Bob', 'GRUBY')
  })

  it('subscribeNotification returns alreadyKnown when recipient already submitted', async () => {
    const { service } = makeService()
    await service.submitSize(T, 'Bob', 'GRUBY', 'Alice')
    await service.submitSize(T, 'Alice', 'MEGA MAŁY', 'Bob')
    expect(await service.subscribeNotification(T, 'Alice', 'alice@x.com', 'Bob')).toEqual({ alreadyKnown: true, size: 'GRUBY' })
  })

  it('subscribeNotification returns subscribed:true when recipient size unknown', async () => {
    const { service } = makeService()
    await service.submitSize(T, 'Alice', 'MEGA MAŁY', 'Bob')
    expect(await service.subscribeNotification(T, 'Alice', 'alice@x.com', 'Bob')).toEqual({ subscribed: true })
  })

  it('getSize returns null for unknown participant', async () => {
    const { service } = makeService()
    expect(await service.getSize(T, 'Unknown')).toBeNull()
  })

  it('getSize returns size after submitSize', async () => {
    const { service } = makeService()
    await service.submitSize(T, 'Alice', 'MEGA MAŁY', 'Bob')
    expect(await service.getSize(T, 'Alice')).toBe('MEGA MAŁY')
  })

  it('scopes participants by trip', async () => {
    const { service } = makeService()
    await service.submitSize(1, 'Alice', 'MEGA MAŁY', 'Bob')
    expect(await service.getSize(2, 'Alice')).toBeNull()
  })
})
