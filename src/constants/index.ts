// App-wide constants
export const APP_CONFIG = {
  name: 'Stat Barn',
  description: 'NHL Game Predictions',
  version: '1.0.0',
} as const

// API constants
export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  retryAttempts: 3,
} as const

// Database constants
export const DB_CONFIG = {
  connectionString: process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/',
  dbName: process.env.MONGODB_DB_NAME || 'local',
  maxPoolSize: 10,
} as const

// ELO constants
export const ELO_CONFIG = {
  kFactor: 32,
  initialRating: 1500,
  homeAdvantage: 100,
} as const
