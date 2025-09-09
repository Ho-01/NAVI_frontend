// Phaser의 EventEmitter 사용(브라우저에서 Node 'events' 대신 안전)
import Phaser from "phaser";

/**
 * 전역 인벤토리 스토어
 * - events: on/off/emit 지원(EventEmitter)
 * - add(key): 중복 없이 추가, 추가되면 'inventory:granted' 이벤트 발행
 * - has(key), items()
 */
export function createInventoryStore(initial = []) {
  const _set = new Set(initial);
  const events = new Phaser.Events.EventEmitter();

  return {
    events,                    // .on(event, handler), .off(event, handler)
    add(key) {
      if (_set.has(key)) return false;
      _set.add(key);
      events.emit("inventory:granted", key);
      return true;
    },
    has: (k) => _set.has(k),
    items: () => Array.from(_set),
  };
}
