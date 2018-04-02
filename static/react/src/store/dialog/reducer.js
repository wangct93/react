/**
 * Created by Administrator on 2018/3/19.
 */
let defaultState = {
    list: []
};

export let dialogData = (state = defaultState, action = {}) => {
    state = wt.clone(state);
    wt.execFunc(reducer[action.type],state,action);
    return state;
};

let reducer = {
    closeDialog(state,action){
        let index = state.list.indexOfFunc(item => item.id === action.id);
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