// Example configuration file - copy to config.ts and fill in your values
export const config = {
  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/',
    dbName: process.env.MONGODB_DB_NAME || 'local',
    maxPoolSize: 10,
  },

  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
    retryAttempts: 3,
  },

  // App Configuration
  app: {
    name: '54Fighting',
    description: 'NHL Stat Lines and Predictions',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // NHL Configuration
  nhl: {
    currentSeason: '2023-2024',
    seasonStartMonth: 10, // October
    seasonEndMonth: 6,    // June
  },

  // ELO Configuration
  elo: {
    kFactor: 32,
    initialRating: 1500,
    homeAdvantage: 100,
  },

  // Optional: External API Keys (if needed in the future)
  // external: {
  //   nhlApiKey: process.env.NHL_API_KEY,
  //   weatherApiKey: process.env.WEATHER_API_KEY,
  // },

  // Optional: Analytics and Monitoring
  // analytics: {
  //   sentryDsn: process.env.SENTRY_DSN,
  //   googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  // },
}

// Environment variable documentation
export const ENV_VARS = {
  MONGODB_URI: 'MongoDB connection string',
  MONGODB_DB_NAME: 'MongoDB database name',
  API_BASE_URL: 'API base URL for external calls',
  PORT: 'Port number for the server',
  NODE_ENV: 'Node environment (development/production)',
  // NHL_API_KEY: 'NHL API key for external data',
  // WEATHER_API_KEY: 'Weather API key for game conditions',
  // SENTRY_DSN: 'Sentry DSN for error tracking',
  // GOOGLE_ANALYTICS_ID: 'Google Analytics tracking ID',
}
