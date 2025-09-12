// /src/features/inventory/api.js
import appClient from "../../core/appClient";

// ✅ named export 로 내보내기
export async function updateMyInventory(itemId, operation, count) {
  const res = await appClient.post(`/runs/in_progress/inventory/items/${itemId}`, { operation, count });
  console.log("[inv] update", { itemId, operation, count, res });
  return res;
}



// ✅ 누락 보완: 보유/미보유 스냅샷 기록용
export async function setInventoryCount(itemId, count) {
  return updateMyInventory(itemId, "SET", count);
}


