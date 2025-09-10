// Auth 서비스: API 호출 + 토큰 저장/삭제
// - 화면/비즈니스 레이어에서는 이 서비스만 쓰면 됨

import TokenStorage from "../../core/tokenStorage.js";
import AuthAPI from "./api.js";

function saveTokensFrom(data) {
  // 공통 응답 형식: { data: { accessToken, refreshToken, ... }, error: null }
  const { accessToken, refreshToken } = data || {};
  if (accessToken) TokenStorage.setAccess(accessToken);
  if (refreshToken) TokenStorage.setRefresh(refreshToken);
  console.log("[AuthService] 토큰 저장:", { accessToken, refreshToken });
}

const AuthService = {
  async startAsGuest() {
    const res = await AuthAPI.startAsGuest();
    saveTokensFrom(res?.data);
    return res; // { provider, userName, accessToken, refreshToken }
  },

  async loginWithGoogle(googleIdToken) {
    const res = await AuthAPI.loginWithGoogle(googleIdToken);
    saveTokensFrom(res?.data);
    return res;
  },

  async loginWithKakao(kakaoAccessToken) {
    const res = await AuthAPI.loginWithKakao(kakaoAccessToken);
    saveTokensFrom(res?.data);
    return res;
  },

  async linkGoogle(googleIdToken) {
    const res = await AuthAPI.linkGoogleIdentity(googleIdToken);
    saveTokensFrom(res?.data); // 연동 후 토큰 재발급
    return res;
  },

  async linkKakao(kakaoAccessToken) {
    const res = await AuthAPI.linkKakaoIdentity(kakaoAccessToken);
    saveTokensFrom(res?.data); // 연동 후 토큰 재발급
    return res;
  },

  async logout() {
    const refreshToken = TokenStorage.getRefresh();
    try {
      await AuthAPI.logout(refreshToken);
    } finally {
      // 명세상 이미 만료/폐기여도 성공 처리 → 어쨌든 토큰 삭제
      TokenStorage.clear();
    }
  },

  isLoggedIn() {
    return !!TokenStorage.getAccess();
  },
};

export default AuthService;
