
export class ActionData {
    /**
     * 传入的是一个对象{[key:number]:Array<string>}
     * @param {*} actions 
     */
    constructor(actions) {
        this.actions = actions;
        this.idList = [];
        for (let k in actions) this.idList.push(k);
    }
    addAction(actionId) {
        if (!this.hasAction(actionId)) this.idList.push(actionId);
        return this;
    }
    actionName(actionId, subId=0) {
        return this.actions[actionId][subId];
    }
    hasAction(actionId) {
        return this.idList.includes(actionId);
    }
    getIds() {
        return this.idList;
    }
}
  