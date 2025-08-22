const TokenStorage = {
    _access: null,
    _refresh: null,
    load(){
        // 액세스 토큰: 세션스토리지 (브라우저 닫으면 제거)
        // 리프레시 토큰: 로컬스토리지 (앱 재실행에도 유지)
        this._access = sessionStorage.getItem("accessToken") || null;
        this._refresh = localStorage.getItem("refreshToken") || null;
    },
    
    getAccess(){
        return this._access;
    },
    getRefresh(){
        return this._refresh;       
    },

    setAccess(token){
        this._access = token || null;
        if(token)sessionStorage.setItem("accessToken", token);
        else sessionStorage.removeItem("accessToken");
    },
    setRefresh(token){
        this._refresh = token || null;
        if(token)localStorage.setItem("refreshToken", token);
        else localStorage.removeItem("refreshToken");
    },
    setTokens({access, refresh}){
        if(access!==undefined) this.setAccess(access);
        if(refresh!==undefined) this.setRefresh(refresh);
    },

    clear(){
        this.setAccess(null);
        this.setRefresh(null);
    }   
};

export default TokenStorage;