const UserStorage = {
    _name: null,

    load(){
        this._name = sessionStorage.getItem("name") || null;
    },

    getName(){
        if (this._name == null) this._name = sessionStorage.getItem("name") || null;
        console.log("[UserStorage] getName:", this._name);
        return this._name;
    },

    setName(name){
        this._name = name || null;
        if(name)sessionStorage.setItem("name", name);
        else sessionStorage.removeItem("name");
        console.log("[UserStorage] setName:", this._name);
    },

    clear(){
        this.setName(null);
    }   
};

export default UserStorage;