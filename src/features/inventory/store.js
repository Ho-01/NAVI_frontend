// store.js
import Phaser from "phaser";
import { ITEM_ID_TO_KEY } from "./catalog";

// initialItems: 초기 보유 아이템(key 배열) 또는 null/undefined/객체
export function createInventoryStore(scene, initialItems) {
    const state = new Map();
  if (Array.isArray(initialItems)) {
    for (const k of initialItems) state.set(k, 1);
  }
  const events = new Phaser.Events.EventEmitter();

  const items = () => Array.from(state.entries()).filter(([,c])=>c>0).map(([k])=>k);
  const getCount = (key) => Number(state.get(key) || 0); 
  const setCount = (key, count) => { 
    const prev = getCount(key); 
    const next = Math.max(0, Number(count||0)); 
    state.set(key, next); 
    if (prev !== next) events.emit("inventory:changed", { key, count: next }); 
    return true; 
  }; 
  const add = (key, delta=1) => setCount(key, getCount(key)+Number(delta||0));

  const grant = (itemKey) => {
    if (getCount(itemKey) === 0) {
      setCount(itemKey, 1); 
      events.emit("inventory:granted", itemKey); 
      return true; 
    } 
    return false;
  };

  // 서버에서 불러오기 (응답 예: { items: [{item_id:101}, ...] } )
  const apiLoad = async () => {
    const res = await fetch("/api/inventory", { credentials: "include" });
    const json = await res.json();

    // 방어: 배열 아니면 빈 배열
    const arr = Array.isArray(json?.items) ? json.items : [];

    // item_id → item_key 매핑
    const ids = arr.map(o => String(o.item_id ?? o.id ?? ""));  // id 필드명 다양성 방어
    const keys = ids.map(id => ITEM_ID_TO_KEY[id]).filter(Boolean);


// 최소 갱신(획득된 것만 count=1로 올림, 다른 키는 보존)
   for (const k of keys) setCount(k, Math.max(1, getCount(k)));
    events.emit("inventory:hydrated", keys);
  };

  return { items, getCount, setCount, add, grant, apiLoad, events };
}