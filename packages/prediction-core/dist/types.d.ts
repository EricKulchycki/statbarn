export interface MatchupFactor {
    homeFactor: number;
    awayFactor: number;
}
export interface PredictionInput {
    homeAbbrev: string;
    awayAbbrev: string;
    homeElo: number;
    awayElo: number;
    matchupFactor?: MatchupFactor;
}
export interface PredictionOutput {
    homeWinProbability: number;
    awayWinProbability: number;
    predictedWinner: string;
}
export interface TeamELOResult {
    eloBefore: number;
    eloAfter: number;
    eloChange: number;
}
export interface ELOCalculationResult {
    homeTeam: TeamELOResult;
    awayTeam: TeamELOResult;
}
export type ELOsByTeam = Record<string, number>;
//# sourceMappingURL=types.d.ts.map