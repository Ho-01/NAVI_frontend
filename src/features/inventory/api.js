// inventory/api.js
import appClient from "../../core/appClient.js";

// ── 조회
export const getMineByRun       = (runId) => appClient.get(`/runs/${runId}/inventory`,          { auth: true });
export const getMineInProgress  = ()      => appClient.get(`/runs/in_progress/inventory`,       { auth: true });

// ── ADD
export const addItemByRun       = (runId, itemId, qty=1) =>
  appClient.post(`/runs/${runId}/inventory/item/${Number(itemId)}`, 
    { operation: "ADD", count: Number(qty) }, { auth: true });

export const addItemInProgress  = (itemId, qty=1) =>
  appClient.post(`/runs/in_progress/inventory/item/${Number(itemId)}`, 
    { operation: "ADD", count: Number(qty) }, { auth: true });

// ── SET
export const setInventoryCountByRun = (runId, itemId, count) =>
  appClient.post(`/runs/${runId}/inventory/item/${Number(itemId)}`, 
    { operation: "SET", count: Number(count) }, { auth: true });

export const setInventoryCountInProgress = (itemId, count) =>
  appClient.post(`/runs/in_progress/inventory/item/${Number(itemId)}`, 
    { operation: "SET", count: Number(count) }, { auth: true });

// 필요 시 개별 import 또는 default 사용 둘 다 가능
export default {
  getMineByRun, getMineInProgress,
  addItemByRun, addItemInProgress,
  setInventoryCountByRun, setInventoryCountInProgress,
};
