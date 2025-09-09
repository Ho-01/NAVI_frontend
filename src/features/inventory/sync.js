import { KEY_TO_ITEM_ID, ALL_ITEM_KEYS } from "../inventory/catalog";
import { setInventoryCount } from "../inventory/api";

// scene.registry의 inventory/gourd를 읽어 "보유=1, 미보유=0"로 전부 SET
export async function syncSnapshot(scene) {
    const reg = scene.game.registry;
    const inv = reg.get("inventory");
    const gourd = reg.get("gourd");
    const have = new Set([
        ...(inv?.items?.() ?? []),
        ...(gourd?.items?.() ?? []),
    ]);

    // 병렬 기록(너무 많으면 적절히 batch 처리)
    const tasks = [];
    for (const key of ALL_ITEM_KEYS) {
        const itemId = KEY_TO_ITEM_ID[key];
        if (!itemId) continue;
        const count = have.has(key) ? 1 : 0;
        tasks.push(setInventoryCount(itemId, count).catch(e => {
            console.warn("[sync] fail", key, itemId, e);
        }));
    }
    await Promise.all(tasks);
    console.log("[sync] snapshot done");
}
