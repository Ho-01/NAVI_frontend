// 서버 DB item.id에 맞춰 실제 키를 모두 매핑
export const KEY_TO_ITEM_ID = {
  // 사방신(예시 id는 서버 값에 맞춰 수정)
  "item_백호": 101,
  "item_주작": 102,
  "item_청룡": 103,
  "item_현무": 104,

  // 유령들
  "ghost_1": 201,
  "ghost_2": 202,
  "ghost_3": 203,
  "ghost_4": 204,
  "ghost_5": 205,

  // 필요 시 추가
  // "map": 301,
  // "box": 302,
};

export const ALL_ITEM_KEYS = Object.keys(KEY_TO_ITEM_ID);
