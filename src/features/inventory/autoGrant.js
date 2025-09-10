import { KEY_TO_ITEM_ID } from "./catalog";
import { updateMyInventory } from "./api";

function routeStoreByKey(key) {
  if (/^ghost_\d+$/i.test(key)) return "gourd";
  if (/^item_\d+$/i.test(key)) return "inventory";
  if (key === "map" || key === "box") return "inventory";
  return null;
}

export function autoGrant(scene, key, opts = {}) {
  if (typeof key !== "string") { console.warn("[autoGrant] invalid key:", key); return false; }
  key = key.trim();

  // 한글키 포함 라우팅 보강
  let storeName = (typeof routeStoreByKey === "function") ? routeStoreByKey(key) : null;
  if (!storeName) {
    if (/^ghost_/i.test(key)) storeName = "gourd";
    else if (/^item_/i.test(key)) storeName = "inventory";
    else { console.warn("[autoGrant] unsupported key:", key); return false; }
  }

  const reg = scene.game.registry;
  const store = reg.get(storeName);
  if (!store) { console.error("[autoGrant] store missing:", storeName); return false; }

  const onceId = opts.onceId;

  // onceId 처리
  if (onceId) {
    let onceSet = reg.get("granted_once_ids");
    if (!(onceSet instanceof Set)) onceSet = new Set();
    if (onceSet.has(onceId)) return false;

    const ok = (store.add?.(key) ?? store.grant?.(key)) === true;
    if (ok) {
      onceSet.add(onceId);
      reg.set("granted_once_ids", onceSet);

      // 백엔드 동기화
      const itemId = KEY_TO_ITEM_ID?.[key];
      if (itemId) updateMyInventory(itemId, "ADD", 1);

      const q = reg.get("rewardQueue") || [];
      q.push(key);
      reg.set("rewardQueue", q);

      console.log(`[grant] ${storeName}:${key} (onceId=${onceId})`);
    }
    return ok;
  }

  // 일반 지급
  const ok = (store.add?.(key) ?? store.grant?.(key)) === true;
  if (ok) {

    const itemId = KEY_TO_ITEM_ID?.[key];
    if (itemId) updateMyInventory(itemId, "ADD", 1);
    const q = reg.get("rewardQueue") || [];
    q.push(key);
    reg.set("rewardQueue", q)
    console.log(`[grant] ${storeName}:${key}`);
  }
  return ok;
}
export default autoGrant;
