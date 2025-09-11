// Run 서비스: API 호출, 기타 데이터 처리
// - 화면/비즈니스 레이어에서는 이 서비스만 쓰면 됨

import RunAPI from "./api.js";
import RunStorage_GYEONGBOKGUNG from "../../core/runStorage_GYEONGBOKGUNG.js";

const STORAGES = {
    "GYEONGBOKGUNG": RunStorage_GYEONGBOKGUNG,
    // 다른 시나리오용 스토리지 추가 가능
};

const RunService = {
  async startNewGame(scenario) {
    const res = await RunAPI.startNewGame(scenario); // { id, scenario, status, hintCount, startedAt }
    STORAGES[scenario].setRunId(res?.data.id);
    STORAGES[scenario].setScenario(res?.data.scenario);
    STORAGES[scenario].setStatus(res?.data.status);
    STORAGES[scenario].setHintCount(res?.data.hintCount);
    STORAGES[scenario].setStartedAt(res?.data.startedAt);
    return res;
  },

  async getLeaderboard(scenario) {
    const res = await RunAPI.getLeaderboard(scenario);
    return res; // { leaderboard: [ { rank, runId, userName, totalPlayMsText, hintCount, clearedDate }, ... ], scenario, total }
  },

  async getMyGame(scenario) {
    const res = await RunAPI.getMyGames(); // { runs: [ { id, scenario, status, hintCount, startedAt }, ... ] }
    const filteredRun = res.data.runs.filter(r => r.scenario === scenario)[0];
    if(!filteredRun) {
        STORAGES[scenario].clear();
        return false;
    } else {
        STORAGES[scenario].setRunId(filteredRun.id);
        STORAGES[scenario].setScenario(filteredRun.scenario);
        STORAGES[scenario].setStatus(filteredRun.status);
        STORAGES[scenario].setHintCount(filteredRun.hintCount);
        STORAGES[scenario].setStartedAt(filteredRun.startedAt);
        return filteredRun.startedAt;
    }
  },

  async gameClear(runId) {
    const res = await RunAPI.gameClear(runId);
    return res; // { id, scenario, status, userName, startedAt, endedAt, TotalPlayMsText, hintCount }
  },
};

export default RunService;
