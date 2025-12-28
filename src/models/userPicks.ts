import mongoose, { Schema, Document, Model } from 'mongoose'

// Individual pick subdocument
export interface Pick {
  gameId: number
  gameDate: Date
  season: number
  pickedTeam: string
  pickedAt: Date
  confidence?: number
  homeTeam: string
  awayTeam: string
  isCorrect?: boolean
  actualWinner?: string
  points?: number
  createdAt: Date
  updatedAt: Date
}

export interface PickDocument extends Pick, Document {}

// Season stats subdocument
export interface SeasonStats {
  season: number
  picks: number
  correct: number
  accuracy: number
  points: number
}

export interface SeasonStatsDocument extends SeasonStats, Document {}

// Main UserPicks document
export interface UserPicks {
  firebaseUid: string
  totalPicks: number
  correctPicks: number
  accuracy: number
  currentStreak: number
  longestStreak: number
  totalPoints: number
  rank?: number
  beatStatbarnCount: number
  seasonStats: SeasonStats[]
  picks: Pick[]
  updatedAt: Date
}

export interface UserPicksDocument extends UserPicks, Document {
  addPick(pickData: Omit<Pick, 'createdAt' | 'updatedAt'>): this
  updatePickResult(gameId: number, actualWinner: string, points: number): this
  getPendingPicks(): Pick[]
  getRecentPicks(limit?: number): Pick[]
}

// Pick subdocument schema
const pickSchema = new Schema(
  {
    gameId: { type: Number, required: true },
    gameDate: { type: Date, required: true },
    season: { type: Number, required: true },
    pickedTeam: { type: String, required: true },
    pickedAt: { type: Date, required: true, default: Date.now },
    confidence: { type: Number, min: 1, max: 5 },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    isCorrect: { type: Boolean },
    actualWinner: { type: String },
    points: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

// Season stats subdocument schema
const seasonStatsSchema = new Schema(
  {
    season: { type: Number, required: true },
    picks: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },
  { _id: false }
)

// Main UserPicks schema
const userPicksSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    totalPicks: { type: Number, default: 0 },
    correctPicks: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    rank: { type: Number },
    beatStatbarnCount: { type: Number, default: 0 },
    seasonStats: [seasonStatsSchema],
    picks: [pickSchema],
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'userpicks',
  }
)

userPicksSchema.index({ totalPoints: -1 }) // For leaderboard
userPicksSchema.index({ 'picks.gameId': 1 }) // For finding picks by game
userPicksSchema.index({ 'picks.gameDate': -1 }) // For recent picks
userPicksSchema.index({ accuracy: -1 }) // For sorting by accuracy

userPicksSchema.virtual('currentSeasonPicks').get(function () {
  const currentSeason = 20252026 // TODO: Make this dynamic
  return this.picks.filter((pick) => pick.season === currentSeason)
})

userPicksSchema.methods.addPick = function (
  pickData: Omit<Pick, 'createdAt' | 'updatedAt'>
) {
  // Check if pick already exists for this game
  const existingPickIndex = this.picks.findIndex(
    (p: Pick) => p.gameId === pickData.gameId
  )

  if (existingPickIndex !== -1) {
    // Update existing pick
    this.picks[existingPickIndex] = {
      ...this.picks[existingPickIndex],
      ...pickData,
      pickedAt: new Date(),
    }
  } else {
    // Add new pick
    this.picks.push({
      ...pickData,
      pickedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    this.totalPicks += 1
  }

  this.markModified('picks')
  return this
}

// Method to update pick result after game ends
userPicksSchema.methods.updatePickResult = function (
  gameId: number,
  actualWinner: string,
  points: number
) {
  const pick = this.picks.find((p: Pick) => p.gameId === gameId)

  if (!pick) {
    throw new Error(`Pick not found for game ${gameId}`)
  }

  const wasCorrect = pick.pickedTeam === actualWinner
  pick.isCorrect = wasCorrect
  pick.actualWinner = actualWinner
  pick.points = points

  // Update overall stats
  if (wasCorrect) {
    this.correctPicks += 1
    this.currentStreak += 1
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak
    }
  } else {
    this.currentStreak = 0
  }

  this.totalPoints += points
  this.accuracy = (this.correctPicks / this.totalPicks) * 100

  // Update season stats
  const seasonIndex = this.seasonStats.findIndex(
    (s: SeasonStats) => s.season === pick.season
  )

  if (seasonIndex !== -1) {
    if (wasCorrect) {
      this.seasonStats[seasonIndex].correct += 1
    }
    this.seasonStats[seasonIndex].points += points
    this.seasonStats[seasonIndex].accuracy =
      (this.seasonStats[seasonIndex].correct /
        this.seasonStats[seasonIndex].picks) *
      100
  } else {
    // Create new season stats
    this.seasonStats.push({
      season: pick.season,
      picks: 1,
      correct: wasCorrect ? 1 : 0,
      accuracy: wasCorrect ? 100 : 0,
      points,
    })
  }

  this.markModified('picks')
  this.markModified('seasonStats')
  return this
}

// Method to get pending picks
userPicksSchema.methods.getPendingPicks = function () {
  return this.picks.filter((pick: Pick) => pick.isCorrect === undefined)
}

// Method to get recent picks
userPicksSchema.methods.getRecentPicks = function (limit: number = 10) {
  return this.picks
    .sort((a: Pick, b: Pick) => b.gameDate.getTime() - a.gameDate.getTime())
    .slice(0, limit)
}

export const UserPicksModel: Model<UserPicksDocument> =
  mongoose.models.UserPicks ||
  mongoose.model<UserPicksDocument>('UserPicks', userPicksSchema)
