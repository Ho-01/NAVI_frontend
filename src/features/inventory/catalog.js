// 서버 DB item.id에 맞춰 실제 키를 모두 매핑
export const KEY_TO_ITEM_ID = {
  // 사방신(예시 id는 서버 값에 맞춰 수정)
  "item_백호": 101,
  "item_주작": 102,
  "item_청룡": 103,
  "item_현무": 104,
  "ghost_잡귀": 201,
  "ghost_아귀": 202,
  "ghost_어둑시니": 203,
};

export const ITEM_ID_TO_KEY = Object.fromEntries(
  Object.entries(KEY_TO_ITEM_ID).map(([k, v]) => [String(v), k])
);

export const ALL_ITEM_KEYS = Object.keys(KEY_TO_ITEM_ID);

// 🔽 추가: 키 정규화(공백 제거/소문자/NFC)
export const normalizeKey = (k) =>
  (k ?? "").toString().trim().toLowerCase().normalize("NFC");

// 🔽 추가: 키 → itemId 해석기
export function resolveItemIdByKey(rawKey) {
  const k = normalizeKey(rawKey);
  if (KEY_TO_ITEM_ID[k] != null) return KEY_TO_ITEM_ID[k];

  // fallback: item_123 형태면 숫자 추출
  const m = /^item_(\d+)$/i.exec(rawKey);
  if (m) return Number(m[1]);

  return undefined;
}