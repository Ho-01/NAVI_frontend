
// inventory/service.js
import inventoryApi from "./api.js";
import { ITEM_ID_TO_KEY, resolveItemIdByKey } from "./catalog.js";
import RunStorage from "../../core/runStorage_GYEONGBOKGUNG.js";

/** 공통 폴백 호출기: runId 우선 → in_progress 폴백 */
async function withRunFallback(runId, runFn, inProgFn) {
  const normalize = (res) => { 
    // appClient가 바디 그대로를 주는 경우(res.items 존재)와 
    // { data: {...} }로 감싸 주는 경우(res.data.items 존재) 모두 대응 
    if (res == null) return { data: null, error: { code: "EMPTY" } }; 
    const data = res?.data ?? res; 
    return { data, error: res?.error }; 
  }; 
 
  if (runId) { 
    const r1 = normalize(await runFn(runId)); 
    if (!r1.error) return { ok: true, data: r1.data, meta: { path: "run" } }; 
  } 
  const r2 = normalize(await inProgFn()); 
  if (!r2.error) return { ok: true, data: r2.data, meta: { path: "in_progress" } }; 
  return { ok: false, error: r2?.error || { code: "UNKNOWN", message: "inventory request failed" } };
}


/** 서버 인벤토리 → 프론트 주입 */
async function hydrate(ctx, { replace = false } = {}) {
  const reg = ctx?.game?.registry ?? ctx?.registry ?? window?.game?.registry;
  if (!reg) throw new Error("[InventoryService] registry missing");

  const runId = RunStorage.getRunId?.();
  const res = await withRunFallback(
    runId,
    (id) => inventoryApi.getMineByRun(id),
    () => inventoryApi.getMineInProgress()
  );
  console.log("[INV][HYDRATE][RAW]", JSON.stringify(res, null, 2));

  if (!res.ok) {
    console.warn("[INV][HYDRATE] 실패:", res.error);
    const store = reg.get("inventory");
    return { ok: false, error: res.error, count: store?.items?.().length ?? 0 };
  }

  const items = Array.isArray(res.data?.items) ? res.data.items : [];

  try {
    console.table(items.map(it => ({
      itemId: it.itemId ?? it.item_id ?? it.id,
      name: it.itemName ?? it.name ?? "",
      count: it.itemCount ?? it.count ?? it.qty ?? 1
    })));
  } catch { }
  const store = reg.get("inventory");
  if (!store) return { ok: true, count: items.length, warn: "inventory store 없음" };

  for (const it of items) {
    const rawId = it.itemId ?? it.item_id ?? it.id;
    if (rawId == null) continue;
    const key = ITEM_ID_TO_KEY[String(rawId)] ?? `item_${rawId}`;
    const count = Number(it.count ?? it.qty ?? 1);
    if (typeof store.setCount === "function") store.setCount(key, count);
  }
  return { ok: true, count: items.length };
}

/** 단건 ADD (Service 레벨에서 폴백 + 에러 반환) */
async function add(itemId, qty = 1) {
  const runId = RunStorage.getRunId?.();
  // 1) ADD 시도
  let r = await withRunFallback(
    runId,
    (id) => inventoryApi.addItemByRun(id, itemId, qty),
    () => inventoryApi.addItemInProgress(itemId, qty)
  );
  if (r.ok) return r;

  // 2) 실패 시 SET=1로 폴백 (신규 행 생성 용도)
  console.warn("[INV][ADD] ADD 실패 → SET(1) 폴백", r.error, { itemId });
  r = await withRunFallback(
    runId,
    (id) => inventoryApi.setInventoryCountByRun(id, itemId, 1),
    () => inventoryApi.setInventoryCountInProgress(itemId, 1)
  );
  return r;
}

/** 강제 SET */
async function setCount(itemId, count) {
  const runId = RunStorage.getRunId?.();
  const r = await withRunFallback(
    runId,
    (id) => inventoryApi.setInventoryCountByRun(id, itemId, count),
    () => inventoryApi.setInventoryCountInProgress(itemId, count)
  );
  return r;
}

/** 보상 키 배열 적용: 실패도 개별 보고 */
async function applyGrants(keys = []) {
  if (!Array.isArray(keys) || !keys.length) return { ok: true, applied: 0, fails: [] };

  const fails = [];
  let applied = 0;

  for (const k of keys) {
    const id = resolveItemIdByKey(k);
    if (!Number.isFinite(id)) { fails.push({ key: k, reason: "map" }); continue; }
    const r = await add(id, 1);
    if (r.ok) applied++;
    else fails.push({ key: k, reason: r.error?.code || "ERR", detail: r.error?.message });
  }
  return { ok: fails.length === 0, applied, fails };

}

export default { hydrate, add, setCount, applyGrants };
