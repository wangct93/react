/**
 * Created by Administrator on 2018/3/19.
 */
let defaultState = {
    list: []
};

export let dialogData = (state = defaultState, action = {}) => {
    wt.execFunc(reducer[action.type], state, action);
    return wt.extend(true, {}, state);
};

let reducer = {
    closeDialog(state,action){
        let index = state.list.indexOfFunc((item) => {
            return item.id === action.id;
        });
        if(index !== -1){
            state.list.splice(index,1);
        }
    },
    addDialog(state,action){
        let data = action.option;
        data.id = 'dialog_' + +new Date();
        state.list.push(data);
    }
};