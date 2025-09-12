// Run 서비스: API 호출, 기타 데이터 처리
// - 화면/비즈니스 레이어에서는 이 서비스만 쓰면 됨
// src/features/run/service.js

import RunAPI from "./api.js";
import RunStorage_GYEONGBOKGUNG from "../../core/runStorage_GYEONGBOKGUNG.js";

const STORAGES = {
  GYEONGBOKGUNG: RunStorage_GYEONGBOKGUNG,
  // 다른 시나리오용 스토리지 추가 가능
};

const getStore = (scenario) => {
  const s = STORAGES[scenario];
  if (!s) throw new Error(`[RunService] Unknown scenario: ${scenario}`);
  return s;
};

const setSafeCheckpoint = (store, cp) => {
  const key = (typeof cp === "string" && cp.trim()) ? cp.trim() : "오프닝";
  store.setCheckpoint(key);
  return key;
};

const RunService = {
  async startNewGame(scenario) {
    const res = await RunAPI.startNewGame(scenario); // { data: { id, scenario, status, hintCount, startedAt, checkpoint? } }
    const d = res?.data || {};
    const store = getStore(scenario);

    store.setRunId(d.id ?? null);
    store.setScenario(d.scenario ?? scenario);
    store.setStatus(d.status ?? "IN_PROGRESS");
    store.setHintCount(d.hintCount ?? 0);
    store.setStartedAt(d.startedAt ?? new Date().toISOString());
    const cp = setSafeCheckpoint(store, d.checkpoint);

    return { ...res, data: { ...d, checkpoint: cp } };
  },

  async getLeaderboard(scenario) { // { leaderboard: [ { rank, runId, userName, totalPlayMsText, hintCount, clearedDate }, ... ], scenario, total }
    return await RunAPI.getLeaderboard(scenario);
  },

  async getMyGame(scenario) {
    const res = await RunAPI.getMyGames(); // { data: { runs: [...] } }
    const runs = res?.data?.runs || [];
    const r = runs.find(x => x.scenario === scenario);

    const store = getStore(scenario);
    if (!r) {
      store.clear();
      return false;
    }

    store.setRunId(r.id ?? null);
    store.setScenario(r.scenario ?? scenario);
    store.setStatus(r.status ?? "IN_PROGRESS");
    store.setHintCount(r.hintCount ?? 0);
    store.setStartedAt(r.startedAt ?? new Date().toISOString());
    const cp = setSafeCheckpoint(store, r.checkpoint);

    // 기존 반환값 유지 + checkpoint도 함께 반환
    return { startedAt: r.startedAt, checkpoint: cp };
  },

  async gameClear(runId) { // { id, scenario, status, userName, startedAt, endedAt, TotalPlayMsText, hintCount }
    return await RunAPI.gameClear(runId);
  },
};

export default RunService;
