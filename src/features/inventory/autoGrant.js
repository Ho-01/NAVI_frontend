import { KEY_TO_ITEM_ID } from "./catalog";
import { updateMyInventory } from "./api";

function routeStoreByKey(key) {
  if (/^ghost_\d+$/i.test(key)) return "gourd";
  if (/^item_\d+$/i.test(key)) return "inventory";
  if (key === "map" || key === "box") return "inventory";
  return null;
}

export function autoGrant(scene, key, opts = {}) {
  if (typeof key !== "string") return false;
  key = key.trim();
  const storeName = routeStoreByKey(key);
  if (!storeName) return false;

  const reg = scene.game.registry;
  const store = reg.get(storeName);

  // onceId 처리
  if (opts.onceId) {
    let onceSet = reg.get("granted_once_ids");
    if (!(onceSet instanceof Set)) onceSet = new Set();
    if (onceSet.has(opts.onceId)) return false;

    const ok = store?.add?.(key);
    if (ok) {
      onceSet.add(opts.onceId);
      reg.set("granted_once_ids", onceSet);
      console.log(`[grant] ${storeName}:${key} (onceId=${opts.onceId})`);

      // ✅ 백엔드 동기화
      const itemId = KEY_TO_ITEM_ID[key];
      if (itemId) updateMyInventory(itemId, "ADD", 1);
    }
    return !!ok;
  }

  // 일반 지급
  const ok = store?.add?.(key);
  if (ok) {
    console.log(`[grant] ${storeName}:${key}`);
    // ✅ 백엔드 동기화
    const itemId = KEY_TO_ITEM_ID[key];
    if (itemId) updateMyInventory(itemId, "ADD", 1);
  }
  return !!ok;
}
export default autoGrant;