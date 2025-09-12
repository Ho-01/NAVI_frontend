// src/features/run/service.js
import RunAPI from "./api.js";
import RunStorage_GYEONGBOKGUNG from "../../core/runStorage_GYEONGBOKGUNG.js";

const STORAGES = {
  GYEONGBOKGUNG: RunStorage_GYEONGBOKGUNG,
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

  async getLeaderboard(scenario) {
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

  async gameClear(runId) {
    return await RunAPI.gameClear(runId);
  },
};

export default RunService;
