import appClient from "../../core/appClient.js";

// 내 프로필 조회
const getMyProfile = () => appClient.get("/users/me");

// 닉네임 변경
const updateMyName = (name) =>
  appClient.put("/users/me", { name }, { auth: true });

// 회원 탈퇴
const deleteMyAccount = () => appClient.delete("/users/me");

export default { getMyProfile, updateMyName, deleteMyAccount };
