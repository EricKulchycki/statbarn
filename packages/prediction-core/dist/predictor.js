"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictGame = predictGame;
const constants_1 = require("./constants");
function predictGame(input) {
    const { homeAbbrev, awayAbbrev, homeElo, awayElo, matchupFactor = { homeFactor: 0, awayFactor: 0 }, } = input;
    const homeAdj = homeElo + constants_1.ELO_CONFIG.homeAdvantage + matchupFactor.homeFactor;
    const awayAdj = awayElo + matchupFactor.awayFactor;
    const ratingDiff = awayAdj - homeAdj;
    const homeWinProbability = 1 / (1 + Math.pow(10, ratingDiff / 400));
    const awayWinProbability = 1 - homeWinProbability;
    return {
        homeWinProbability,
        awayWinProbability,
        predictedWinner: homeWinProbability >= 0.5 ? homeAbbrev : awayAbbrev,
    };
}
//# sourceMappingURL=predictor.js.map