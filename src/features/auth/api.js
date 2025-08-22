// Auth API 호출만 정의 (응답 가공/토큰 저장은 service에서)

import appClient from "../../core/appClient.js";

// 게스트 시작 (비로그인, auth:false)
const startAsGuest = () =>
  appClient.post("/auth/guest/start", undefined, { auth: false });

// 구글 로그인 (비로그인, auth:false)
const loginWithGoogle = (googleIdToken) =>
  appClient.post(
    "/auth/google/login",
    { googleIdToken },
    { auth: false }
  );

// 카카오 로그인 (비로그인, auth:false)
const loginWithKakao = (kakaoAccessToken) =>
  appClient.post(
    "/auth/kakao/login",
    { kakaoAccessToken },
    { auth: false }
  );

// 게스트 -> 구글 연동 (인증 필요)
const linkGoogleIdentity = (googleIdToken) =>
  appClient.post("/auth/link/google", { googleIdToken });

// 게스트 -> 카카오 연동 (인증 필요)
const linkKakaoIdentity = (kakaoAccessToken) =>
  appClient.post("/auth/link/kakao", { kakaoAccessToken });

// 로그아웃 (명세상 Authorization 불필요, auth:false)
const logout = (refreshToken) =>
  appClient.post(
    "/auth/logout",
    { refreshToken },
    { auth: false }
  );

export default {
  startAsGuest,
  loginWithGoogle,
  loginWithKakao,
  linkGoogleIdentity,
  linkKakaoIdentity,
  logout,
};
