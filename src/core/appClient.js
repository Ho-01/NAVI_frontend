// 공통 HTTP 클라이언트 (fetch 기반)
// - 기본 JSON 전송/수신
// - 401 시 리프레시 1회만 실행(동시요청 보호) + 원요청 1회 재시도

import { SERVER_URL } from "./config.js";
import TokenStorage from "./tokenStorage.js";


// -------------------- 공통 유틸 --------------------
// 동시 다발 401 보호용
let refreshPromise = null;

// JSON 파싱 안전 처리
async function toJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// 에러 통일 포맷
function toError(res, json) {
  const err = new Error(json?.error?.message || res.statusText);
  err.status = res.status;
  err.code = json?.error?.code;
  err.raw = json;
  return err;
}


// -------------------- 리프레시 보장 --------------------
// (여러 요청이 동시에 와도 1번만 수행)
async function ensureRefreshed() {
  if (refreshPromise) return refreshPromise; // 진행 중이면 같은 약속 기다림

  refreshPromise = (async () => {
    try {
      const rt = TokenStorage.getRefresh();
      if (!rt) return false;

      const res = await fetch(`${SERVER_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });

      // JSON 파싱 실패도 false로 흡수
      let json = {};
      try { json = await res.json(); } catch (_) {}

      if (!res.ok) {
        TokenStorage.clear(); // 또는 clearAll
        return false;
      }

      const { accessToken, refreshToken: newRefresh } = json?.data || {};
      if (!accessToken || !newRefresh) {
        TokenStorage.clear();
        return false;
      }

      TokenStorage.setTokens({ accessToken, refreshToken: newRefresh });
      return true;
    } catch (e) {
      // 네트워크/기타 예외도 false로 통일
      return false;
    } finally {
      refreshPromise = null; // 끝나면 초기화
    }
  })();
  return refreshPromise;
}


// -------------------- 실제 요청 --------------------
async function request(path, { method = "GET", body, headers = {}, auth = true, _retry = false } = {}) {
  const reqHeaders = { ...headers };

  // body가 있을 때만 Content-Type = application/json 헤더 추가
  if (body !== undefined) reqHeaders["Content-Type"] = "application/json";

  // auth=true 면 accessToken 꺼내서 Authorization 헤더 추가
  const access = TokenStorage.getAccess();
  if (auth && access) reqHeaders["Authorization"] = `Bearer ${access}`;

  try {
    const res = await fetch(`${SERVER_URL}${path}`, {
        method,
        headers: reqHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // 401이면: (인증 필요 요청이고, 아직 재시도 안했으면) 리프레시 -> 원요청 1회 재시도
    if (res.status === 401 && auth && !_retry) {
        const result = await ensureRefreshed();
        if(result){
            return request(path, { method, body, headers, auth, _retry: true });
        }else {
            TokenStorage.clear();
        }
    }

    // 서버가 항상 JSON({data, error}) 반환한다고 가정
    const json = await res.json().catch(() => ({
        data: null,
        error: { code: "BAD_JSON", message: "JSON 파싱 실패" }
    }));
    
    // throw 없음 : 항상 {data, error} 반환
    return json;
    
  } catch(e){
    // 네트워크 에러도 표준 에러로 통일
    return{data:null,error:{code:"NETWORK_ERROR",message:"네트워크 오류"}};
  }
}

// 편의 메서드
const appClient = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

export default appClient;