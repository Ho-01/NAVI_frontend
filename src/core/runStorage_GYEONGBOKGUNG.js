const RunStorage = {
    _runId: null,
    _scenario: null, // GYEONGBOKGUNG
    _status: null, // IN_PROGRESS, CLEARED
    _checkpoint: null, // 현재 위치 (씬 키)
    _hintCount: 0,
    _startedAt: null,

    load(){
        this._runId = sessionStorage.getItem("runId") || null;
        this._scenario = sessionStorage.getItem("scenario") || null;
        this._status = sessionStorage.getItem("status") || null;
        this._hintCount = sessionStorage.getItem("hintCount") || 0;
        this._startedAt = sessionStorage.getItem("startedAt") || null;
        this._checkpoint = sessionStorage.getItem("checkpoint") || null;
    },

    getRunId(){
        if (this._runId == null) this._runId = sessionStorage.getItem("runId") || null;
        console.log("[RunStorage] getRunId:", this._runId);
        return this._runId;
    },
    getScenario(){
        if (this._scenario == null) this._scenario = sessionStorage.getItem("scenario") || null;
        console.log("[RunStorage] getScenario:", this._scenario);
        return this._scenario;
    },
    getStatus(){
        if (this._status == null) this._status = sessionStorage.getItem("status") || null;
        console.log("[RunStorage] getStatus:", this._status);
        return this._status;
    },
    getCheckpoint(){
        if (this._checkpoint == null) this._checkpoint = sessionStorage.getItem("checkpoint") || null;
        console.log("[RunStorage] getCheckpoint:", this._checkpoint);
        return this._checkpoint;
    },
    getHintCount(){
        if (this._hintCount == null) this._hintCount = sessionStorage.getItem("hintCount") || 0;
        console.log("[RunStorage] getHintCount:", this._hintCount);
        return this._hintCount;
    },
    getStartedAt(){
        if (this._startedAt == null) this._startedAt = sessionStorage.getItem("startedAt") || null;
        console.log("[RunStorage] getStartedAt:", this._startedAt);
        return this._startedAt;
    },

    setRunId(id){
        this._runId = id || null;
        if(id)sessionStorage.setItem("runId", id);
        else sessionStorage.removeItem("runId");
        console.log("[RunStorage] setRunId:", id);
    },
    setScenario(scenario){
        this._scenario = scenario || null;
        if(scenario)sessionStorage.setItem("scenario", scenario);
        else sessionStorage.removeItem("scenario");
        console.log("[RunStorage] setScenario:", scenario);
    },
    setStatus(status){
        this._status = status || null;
        if(status)sessionStorage.setItem("status", status);
        else sessionStorage.removeItem("status");
        console.log("[RunStorage] setStatus:", status);
    },
    setCheckpoint(checkpoint){
        this._checkpoint = checkpoint || null;
        if(checkpoint)sessionStorage.setItem("checkpoint", checkpoint);
        else sessionStorage.removeItem("checkpoint");
        console.log("[RunStorage] setCheckpoint:", checkpoint);
    },
    setHintCount(count){
        this._hintCount = count || 0;
        sessionStorage.setItem("hintCount", this._hintCount);
        console.log("[RunStorage] setHintCount:", count);
    },
    setStartedAt(time){
        this._startedAt = time || null;
        if(time)sessionStorage.setItem("startedAt", time);
        else sessionStorage.removeItem("startedAt");
        console.log("[RunStorage] setStartedAt:", time);
    },

    clear(){
        this.setRunId(null);
        this.setScenario(null);
        this.setStatus(null);
        this.setHintCount(null);
        this.setStartedAt(null);
        this.setCheckpoint(null);
    }   
};

export default RunStorage;