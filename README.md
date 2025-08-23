# 54Fighting - NHL Stats & Predictions

A Remix-based web application for NHL statistics, ELO ratings, and game predictions.

## 🏗️ Project Structure

```
54Fighting/
├── app/                          # Main application code
│   ├── components/               # React components
│   │   ├── ui/                  # Base UI components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── features/            # Feature-specific components
│   │       ├── ELO.tsx
│   │       ├── GameBanner.tsx
│   │       ├── GamePredictions.tsx
│   │       └── Live.tsx
│   ├── constants/               # App-wide constants
│   │   └── index.ts
│   ├── data/                    # Data fetching functions
│   │   ├── games.ts
│   │   ├── latest-elo.get.ts
│   │   ├── predictions.ts
│   │   ├── standings.ts
│   │   ├── team-games.fetch.ts
│   │   └── teams.ts
│   ├── hooks/                   # Custom React hooks
│   │   └── useAsyncData.ts
│   ├── routes/                  # Remix routes
│   │   └── _index.tsx
│   ├── services/                # Business logic services
│   │   ├── database.service.ts
│   │   ├── elo.service.ts
│   │   └── game.service.ts
│   ├── types/                   # TypeScript type definitions
│   │   ├── common.ts
│   │   ├── elo.ts
│   │   ├── errors.ts
│   │   ├── game.ts
│   │   ├── standings.ts
│   │   ├── team.ts
│   │   └── time.ts
│   ├── utils/                   # Utility functions
│   │   └── currentSeason.ts
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── root.tsx
│   └── tailwind.css
├── lib/                         # Core libraries
│   ├── db.ts                   # Database connection
│   ├── elo.ts                  # ELO calculation logic
│   ├── eloCalculator.ts        # Comprehensive ELO processor
│   └── predictions.ts          # Prediction algorithms
├── models/                      # Database models
│   ├── elo.ts                  # Season ELO data
│   ├── gameElo.ts              # Individual game ELO changes
│   └── prediction.ts           # Game predictions
├── scripts/                     # Utility scripts
│   ├── pruneDuplicateGames.ts
│   ├── seedEloData.ts          # Basic ELO seeding
│   ├── seedHistoricalElo.ts    # 10-year historical ELO seeding
│   ├── seedCurrentSeasonElo.ts # Current season ELO updates
│   └── analyzeEloProgression.ts # ELO data analysis
└── docker/                      # Docker configuration
    └── docker-compose.yml
```

## 🚀 Architecture Overview

### Service Layer Pattern

The application follows a service-oriented architecture where business logic is separated from UI components:

- **DatabaseService**: Handles database connections and health checks
- **EloService**: Manages ELO rating calculations and team rankings
- **GameService**: Handles game data fetching and predictions

### Error Handling

Comprehensive error handling with:

- Custom error types (`AppError`, `ValidationError`, `DatabaseError`, etc.)
- Error boundaries for React components
- Consistent error responses across the application

### Type Safety

- Full TypeScript implementation
- Centralized type definitions
- Runtime validation support

### Component Architecture

- **UI Components**: Reusable base components (ErrorBoundary, LoadingSpinner)
- **Layout Components**: Header, Footer, and navigation
- **Feature Components**: Domain-specific components (ELO, GamePredictions)

## 🛠️ Development

### Prerequisites

- Node.js >= 20.0.0
- MongoDB
- Docker (optional)

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Building

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## 🏒 ELO Rating System

### Historical ELO Seeding

The application includes a comprehensive ELO rating system that processes every NHL game from the last 10 years chronologically, ensuring proper ELO progression.

#### Available Scripts

- **`npm run seed:historical`** - Process 10 years of historical data
- **`npm run seed:current`** - Process current season data
- **`npm run seed:update`** - Incremental update for current season
- **`npm run analyze:elo`** - Analyze ELO progression and data quality

#### How It Works

1. **Chronological Processing**: Games are processed in chronological order to maintain ELO progression
2. **Season Continuity**: ELOs from one season carry over to the next
3. **Game-by-Game Tracking**: Each game records ELO changes, predictions, and outcomes
4. **Data Validation**: Comprehensive checks ensure data quality and consistency

#### Data Models

- **`SeasonELO`**: Final ELO ratings for each team per season
- **`GameELO`**: Detailed ELO changes for each individual game
- **`Prediction`**: Game outcome predictions with accuracy tracking

#### ELO Calculation Features

- **Home Ice Advantage**: 150 ELO points for home teams
- **Dynamic K-Factor**: Adjusts based on goal difference (blowout factor)
- **Win Probability**: Calculates expected win probability for each team
- **Prediction Accuracy**: Tracks prediction success rates

#### Usage Examples

```bash
# Seed 10 years of historical data (one-time setup)
npm run seed:historical

# Process current season
npm run seed:current

# Update with new games (run periodically)
npm run seed:update

# Analyze data quality and progression
npm run analyze:elo
```

#### Expected Output

The seeding process will create:

- **~12,000+ game ELO records** (10 years × ~1,230 games per season)
- **~300+ season ELO records** (10 years × ~30 teams)
- **~12,000+ predictions** with accuracy tracking
- **Complete ELO progression** showing how team ratings evolved over time

## 🔧 Key Features

### ELO Rating System

- Real-time team rating calculations
- Season-based rating updates
- Historical rating tracking

### Game Predictions

- Machine learning-based predictions
- Historical performance analysis
- Confidence scoring

### Live Data

- Real-time game updates
- Live statistics
- Performance metrics

## 📊 Data Models

### Core Entities

- **Team**: NHL team information and metadata
- **Game**: Game details, scores, and statistics
- **EloData**: Team ELO ratings over time
- **Prediction**: Game outcome predictions

### Database Schema

MongoDB with Mongoose ODM for flexible schema management and type safety.

## 🎨 UI/UX

### Design System

- Tailwind CSS for styling
- Responsive design patterns
- Consistent component library

### User Experience

- Intuitive navigation
- Real-time updates
- Mobile-first approach

## 🔒 Security & Performance

### Security Features

- Input validation
- Error sanitization
- Secure database connections

### Performance Optimizations

- Lazy loading
- Efficient data fetching
- Caching strategies

## 🚀 Deployment

### Docker Support

```bash
docker-compose up -d
```

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB_NAME`: Database name
- `API_BASE_URL`: API base URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.
