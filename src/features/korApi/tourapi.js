// src/features/korApi/tourapi.js
export async function fetchIntro(contentId, contentTypeId, opts = {}) {
  const key = import.meta.env.VITE_TOURAPI_KEY; // .env에 세팅
  if (!key) throw new Error("VITE_TOURAPI_KEY 미설정");

  const qs = new URLSearchParams({
    serviceKey: key,          // KorService2는 'serviceKey' (v1은 'ServiceKey')
    MobileOS: "ETC",
    MobileApp: "NAVI",
    _type: "json",
    contentId: String(contentId),
    contentTypeId: String(contentTypeId),
  });

  // const url = `/api/tour/detailIntro2?${qs.toString()}`;
  const base = "https://apis.data.go.kr/B551011/KorService2";
  const url = `${base}/detailIntro2?${qs.toString()}`;
  const res = await fetch(url, { signal: opts.signal });
  const ct = res.headers.get("content-type") || "";
  const raw = await res.text();
  console.log("[tourapi] status", res.status, ct, raw.slice(0, 200));

  if (!res.ok) throw new Error("HTTP " + res.status);

  // JSON 파싱
  let data;
  if (ct.includes("application/json") || raw.trim().startsWith("{") || raw.trim().startsWith("[")) {
    data = JSON.parse(raw);
  } else {
    // XML이면 에러 메시지 노출
    throw new Error("Non-JSON from proxy: " + raw.slice(0, 160));
  }

  const header = data?.response?.header;
  if (header?.resultCode !== "0000") {
    throw new Error(header?.resultMsg || "TourAPI error");
  }
  const item = data?.response?.body?.items?.item?.[0] || {};
  return normalizeIntro(Number(contentTypeId), item);
}

function normalizeIntro(ct, item) {
  const map = {
    12: { rest: "restdate", open: "opendate", hours: ["usetime"] },
    14: { rest: "restdateculture", hours: ["usetimeculture"] },
    15: { range: ["eventstartdate","eventenddate"] },
    28: { rest: "restdateleports", open: "openperiod", hours: ["usetimeleports"] },
    32: { hours: ["checkintime","checkouttime"] },
    38: { rest: "restdateshopping", open: "opentimeshopping", hours: ["opentime"] },
    39: { rest: "restdatefood", open: "opendatefood", hours: ["opentimefood"] },
  }[ct] || {};
  const hours = map.hours?.map(k => item[k]).find(Boolean) ?? null;
  const openPeriod = map.range
    ? joinRange(item[map.range[0]], item[map.range[1]])
    : (map.open ? (item[map.open] ?? null) : null);
  return { restText: map.rest ? (item[map.rest] ?? "") : "", openPeriod, hours, raw: item };
}
function joinRange(a,b){const L=(a??"").trim(),R=(b??"").trim(); if(!L&&!R)return ""; if(!L)return R; if(!R)return L; return `${L}~${R}`; }

export function checkOpenToday(restText, date=new Date()){
  const DAY_MAP={"일":0,"월":1,"화":2,"수":3,"목":4,"금":5,"토":6};
  if(!restText) return { openToday:true, reason:"no-rest-text" };
  const t=restText.replace(/\s+/g,"");
  if(/연중무휴|무휴|휴무없음|항시개방|항시운영/.test(t)) return { openToday:true, reason:"always-open" };
  const wd=[...t.matchAll(/[일월화수목금토](?=요일?)/g)].map(m=>DAY_MAP[m[0]]); const set=new Set(wd);
  if(set.has(date.getDay()) && /(휴관|휴무|정기휴무|휴장)/.test(t)) return { openToday:false, reason:"weekly-rest" };
  const mmdd=`${date.getMonth()+1}-${date.getDate()}`;
  const specific=[...t.matchAll(/(\d{1,2})월(\d{1,2})일/g)].map(m=>`${+m[1]}-${+m[2]}`);
  if(specific.includes(mmdd)) return { openToday:false, reason:"specific-date" };
  return { openToday:true, reason:"default-open" };
}
