import mongoose from 'mongoose'
import { Database } from '@/lib/db'
import { createDatabaseError } from '@/types/errors'

export class DatabaseService {
  private static instance: DatabaseService
  private database: Database

  private constructor() {
    this.database = Database.getInstance()
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async connect(): Promise<void> {
    try {
      await this.database.connect()
    } catch (error) {
      throw createDatabaseError(
        'connect',
        `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'database'
      )
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.database.disconnect()
    } catch (error) {
      throw createDatabaseError(
        'disconnect',
        `Failed to disconnect from database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'database'
      )
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const connection = mongoose.connection
      return connection.readyState === 1 // Connected
    } catch {
      return false
    }
  }

  getConnection(): mongoose.Connection {
    return mongoose.connection
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance()
