// /src/features/inventory/api.js
import appClient from "../../core/appClient";

// ✅ named export 로 내보내기
export async function updateMyInventory(itemId, operation, count) {
    return appClient.post(`/runs/in_progress/inventory/items/${itemId}`, {
        operation,   // "ADD" | "REMOVE" | "SET"
        count        // number
    });
}
export default updateMyInventory;