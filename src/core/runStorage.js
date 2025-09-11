const RunStorage = {
    _runId: null,
    _scenario: null, // GYEONGBOKGUNG
    _status: null, // IN_PROGRESS, CLEARED
    _hintCount: 0,
    _startedAt: null,

    load(){
        this._runId = sessionStorage.getItem("runId") || null;
        this._scenario = sessionStorage.getItem("scenario") || null;
        this._status = sessionStorage.getItem("status") || null;
        this._hintCount = sessionStorage.getItem("hintCount") || 0;
        this._startedAt = sessionStorage.getItem("startedAt") || null;
    },

    getRunId(){
        if (this._runId == null) this._runId = sessionStorage.getItem("runId") || null;
        return this._runId;
    },
    getScenario(){
        if (this._scenario == null) this._scenario = sessionStorage.getItem("scenario") || null;
        return this._scenario;
    },
    getStatus(){
        if (this._status == null) this._status = sessionStorage.getItem("status") || null;
        return this._status;
    },
    getHintCount(){
        if (this._hintCount == null) this._hintCount = sessionStorage.getItem("hintCount") || 0;
        return Number(this._hintCount);
    },
    getStartedAt(){
        if (this._startedAt == null) this._startedAt = sessionStorage.getItem("startedAt") || null;
        return this._startedAt;
    },

    setRunId(id){
        this._runId = id || null;
        if(id)sessionStorage.setItem("runId", id);
        else sessionStorage.removeItem("runId");
    },
    setScenario(scenario){
        this._scenario = scenario || null;
        if(scenario)sessionStorage.setItem("scenario", scenario);
        else sessionStorage.removeItem("scenario");
    },
    setStatus(status){
        this._status = status || null;
        if(status)sessionStorage.setItem("status", status);
        else sessionStorage.removeItem("status");
    },
    setHintCount(count){
        this._hintCount = count || 0;
        sessionStorage.setItem("hintCount", this._hintCount);
    },
    setStartedAt(time){
        this._startedAt = time || null;
        if(time)sessionStorage.setItem("startedAt", time);
        else sessionStorage.removeItem("startedAt");
    },

    clear(){
        this.setRunId(null);
        this.setScenario(null);
        this.setStatus(null);
        this.setHintCount(null);
        this.setStartedAt(null);
    }   
};

export default RunStorage;