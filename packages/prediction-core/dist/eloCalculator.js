"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateELOUpdate = calculateELOUpdate;
exports.adjustKFactor = adjustKFactor;
exports.regressToMean = regressToMean;
const constants_1 = require("./constants");
const predictor_1 = require("./predictor");
function calculateELOUpdate(homeAbbrev, awayAbbrev, homeElo, awayElo, homeScore, awayScore, matchupFactor = { homeFactor: 0, awayFactor: 0 }, kFactor = constants_1.ELO_CONFIG.kFactor) {
    const { homeWinProbability: homeExpected, awayWinProbability: awayExpected } = (0, predictor_1.predictGame)({ homeAbbrev, awayAbbrev, homeElo, awayElo, matchupFactor });
    const homeActualResult = homeScore > awayScore ? 1 : homeScore === awayScore ? 0.5 : 0;
    const awayActualResult = 1 - homeActualResult;
    const homeEloChange = kFactor * (homeActualResult - homeExpected);
    const awayEloChange = kFactor * (awayActualResult - awayExpected);
    return {
        homeTeam: {
            eloBefore: homeElo,
            eloAfter: homeElo + homeEloChange,
            eloChange: homeEloChange,
        },
        awayTeam: {
            eloBefore: awayElo,
            eloAfter: awayElo + awayEloChange,
            eloChange: awayEloChange,
        },
    };
}
function adjustKFactor(baseK, goalDiff) {
    if (goalDiff === 0)
        return baseK;
    const cappedDiff = Math.min(goalDiff, 4);
    const adjustedK = baseK * (1 + Math.log(1 + cappedDiff) * 0.3);
    return Math.min(adjustedK, 100);
}
function regressToMean(elo) {
    return elo + (constants_1.ELO_CONFIG.initialRating - elo) * constants_1.ELO_CONFIG.meanRegressionFactor;
}
//# sourceMappingURL=eloCalculator.js.map