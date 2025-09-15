// autoGrant.js
import InventoryService from "./service";        // ✅ 변경: service 사용
import { resolveItemIdByKey } from "./catalog";

function routeStoreByKey(key) {
  if (/^ghost_/i.test(key)) return "gourd";
  if (/^item_/i.test(key))  return "inventory";
  if (key === "map" || key === "box") return "inventory";
  return null;
}

export function autoGrant(scene, key, opts = {}) {
  if (typeof key !== "string") { console.warn("[autoGrant] invalid key:", key); return false; }
  key = key.trim();

  const reg = scene.game.registry;
  const storeName = routeStoreByKey(key);
  if (!storeName) { console.warn("[autoGrant] unsupported key:", key); return false; }

  const store = reg.get(storeName);
  if (!store) { console.error("[autoGrant] store missing:", storeName); return false; }

  const onceId = opts.onceId;

  const grantAndSync = async () => {
    const ok = (store.add?.(key) ?? store.grant?.(key)) === true;
    if (!ok) return false;

    if (/^(item_|ghost_)/i.test(key)) {
      const itemId = resolveItemIdByKey(key);
      if (Number.isFinite(itemId)) {
        const r = await InventoryService.add(itemId, 1);  // ✅ 서비스 경유 (폴백+에러 전달)
        if (!r.ok) {
          console.warn("[autoGrant] ADD 실패", r.error, { itemId, key });
          return false;
        }
        console.log("[autoGrant] server OK", { itemId, key, meta: r.meta });
      } else {
        console.warn("[autoGrant] itemId mapping not found:", key);
      }
    }

    const q = reg.get("rewardQueue") || [];
    q.push(key);
    reg.set("rewardQueue", q);
    return true;
  };

  if (onceId) {
    let onceSet = reg.get("granted_once_ids");
    if (!(onceSet instanceof Set)) onceSet = new Set();
    if (onceSet.has(onceId)) return false;

    return grantAndSync().then(ok => {
      if (ok) {
        onceSet.add(onceId);
        reg.set("granted_once_ids", onceSet);
        console.log(`[grant] ${storeName}:${key} (onceId=${onceId})`);
      }
      return ok;
    });
  }

  return grantAndSync().then(ok => {
    if (ok) console.log(`[grant] ${storeName}:${key}`);
    return ok;
  });
}

export default autoGrant;