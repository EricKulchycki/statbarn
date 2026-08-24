import type { ELOCalculationResult, MatchupFactor } from './types';
export declare function calculateELOUpdate(homeAbbrev: string, awayAbbrev: string, homeElo: number, awayElo: number, homeScore: number, awayScore: number, matchupFactor?: MatchupFactor, kFactor?: number): ELOCalculationResult;
export declare function adjustKFactor(baseK: number, goalDiff: number): number;
export declare function regressToMean(elo: number): number;
//# sourceMappingURL=eloCalculator.d.ts.map