import { DB_CONFIG } from '@/constants'
import mongoose from 'mongoose'

// Held on globalThis so Next.js hot reloads, which re-evaluate this module,
// share one in-flight connection instead of opening another
const globalForDb = globalThis as typeof globalThis & {
  dbConnectPromise?: Promise<typeof mongoose> | null
}

class Database {
  private static instance: Database

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  // Safe to call before every query: concurrent callers share one attempt,
  // and a failed or dropped connection is retried on the next call
  public async connect(): Promise<void> {
    const { readyState } = mongoose.connection
    if (readyState === mongoose.ConnectionStates.connected) return
    if (readyState === mongoose.ConnectionStates.disconnected) {
      globalForDb.dbConnectPromise = null
    }

    if (!globalForDb.dbConnectPromise) {
      globalForDb.dbConnectPromise = mongoose
        .connect(DB_CONFIG.connectionString, { dbName: DB_CONFIG.dbName })
        .then((connected) => {
          console.log('Connected to the database.')
          return connected
        })
        .catch((error) => {
          globalForDb.dbConnectPromise = null
          console.error('Error connecting to the database:', error)
          throw error
        })
    }

    await globalForDb.dbConnectPromise
  }

  public disconnect(): void {
    globalForDb.dbConnectPromise = null
    mongoose.disconnect()
    console.log('Disconnected from the database.')
  }
}

export { Database }
