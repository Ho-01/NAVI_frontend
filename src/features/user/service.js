// 단순 래핑: 필요 시 캐싱/전처리 로직 추가 가능
import UserAPI from "./api.js";

const UserService = {
  async getMyProfile() {
    const res = await UserAPI.getMyProfile();
    return res; // { id, name, provider }
  },
  async updateMyName(name) {
    const res = await UserAPI.updateMyName(name);
    return res;
  },
  async deleteMyAccount() {
    const res = await UserAPI.deleteMyAccount();
    return res; // "회원 탈퇴 완료"
  },
};

export default UserService;
