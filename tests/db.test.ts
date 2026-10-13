import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const DISCONNECTED = 0
const CONNECTED = 1
const CONNECTING = 2

const mongooseMock = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  connection: { readyState: 0 },
  ConnectionStates: { disconnected: 0, connected: 1, connecting: 2 },
}))

vi.mock('mongoose', () => ({ default: mongooseMock }))

import { Database } from '../src/lib/db'

// Mirrors mongoose: state is `connecting` as soon as connect() is called
function connectSucceedsAfterTick() {
  mongooseMock.connect.mockImplementation(() => {
    mongooseMock.connection.readyState = CONNECTING
    return new Promise((resolve) =>
      setTimeout(() => {
        mongooseMock.connection.readyState = CONNECTED
        resolve(mongooseMock)
      })
    )
  })
}

describe('Database.connect', () => {
  const db = Database.getInstance()

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    db.disconnect()
    mongooseMock.connection.readyState = DISCONNECTED
    mongooseMock.connect.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shares one connection attempt across concurrent callers', async () => {
    connectSucceedsAfterTick()

    await Promise.all([db.connect(), db.connect(), db.connect()])

    expect(mongooseMock.connect).toHaveBeenCalledTimes(1)
  })

  it('does not reconnect when already connected', async () => {
    mongooseMock.connection.readyState = CONNECTED

    await db.connect()

    expect(mongooseMock.connect).not.toHaveBeenCalled()
  })

  it('retries on the next call after a failed attempt', async () => {
    mongooseMock.connect.mockRejectedValueOnce(new Error('unreachable'))
    await expect(db.connect()).rejects.toThrow('unreachable')

    connectSucceedsAfterTick()
    await db.connect()

    expect(mongooseMock.connect).toHaveBeenCalledTimes(2)
  })

  it('reconnects when a previously opened connection has dropped', async () => {
    connectSucceedsAfterTick()
    await db.connect()

    mongooseMock.connection.readyState = DISCONNECTED
    await db.connect()

    expect(mongooseMock.connect).toHaveBeenCalledTimes(2)
  })
})
