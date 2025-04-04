import mongoose from 'mongoose'

class Database {
  private static instance: Database
  private connection: mongoose.Connection | null = null

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  public async connect(): Promise<void> {
    if (this.connection) {
      console.log('Already connected to the database.')
      return
    }

    try {
      await mongoose.connect('mongodb://0.0.0.0:27017/', {
        dbName: 'local',
      })
      this.connection = mongoose.connection
      console.log('Connected to the database.')
    } catch (error) {
      console.error('Error connecting to the database:', error)
      throw error
    }
  }

  public disconnect(): void {
    if (this.connection) {
      mongoose.disconnect()
      this.connection = null
      console.log('Disconnected from the database.')
    }
  }
}

export { Database }
