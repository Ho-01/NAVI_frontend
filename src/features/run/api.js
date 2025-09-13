// Auth API 호출만 정의 (응답 가공/토큰 저장은 service에서)

import appClient from "../../core/appClient.js";

const startNewGame = (scenario) =>
    appClient.post("/runs", { scenario }, { auth: true });

const getLeaderboard = (scenario) =>
    appClient.get(`/runs/${scenario}/leaderboard`, { auth: true });

const getMyGames = () =>
    appClient.get("/runs/in_progress", { auth: true });

const getMyClearedGames = () =>
    appClient.get("/runs/cleared", { auth: true });

const updateCheckpoint = (runId, checkpoint) =>
    appClient.put(`/runs/${runId}/checkpoint`, { checkpoint }, { auth: true });

const gameClear = (runId) =>
    appClient.put(`/runs/${runId}`, undefined, { auth: true });


export default {
  startNewGame,
  getLeaderboard,
  getMyGames,
  getMyClearedGames,
  updateCheckpoint,
  gameClear,
};