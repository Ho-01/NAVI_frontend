// Run 서비스: API 호출, 기타 데이터 처리
// - 화면/비즈니스 레이어에서는 이 서비스만 쓰면 됨

import RunAPI from "./api.js";

const RunService = {
  async startNewGame(scenario) {
    const res = await RunAPI.startNewGame(scenario); // { id, scenario, status, hintCount, startedAt }
    return res; 
  },

  async getLeaderboard(scenario) {
    const res = await RunAPI.getLeaderboard(scenario);
    return res; // { leaderboard: [ { rank, runId, userName, totalPlayMsText, hintCount, clearedDate }, ... ], scenario, total }
  },

  async getMyGames() {
    const res = await RunAPI.getMyGames();
    return res; // { runs: [ { id, scenario, status, hintCount, startedAt }, ... ] }
  },

  async gameClear(runId) {
    const res = await RunAPI.gameClear(runId);
    return res; // { id, scenario, status, userName, startedAt, endedAt, TotalPlayMsText, hintCount }
  },
};

export default RunService;
