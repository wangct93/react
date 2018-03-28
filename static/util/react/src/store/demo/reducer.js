/**
 * Created by Administrator on 2018/3/7.
 */
let defaultState = {
    name:'wangct'
};

export let demoData = (state = defaultState,action = {}) => {
    switch(action.type){
        case 'changeName':
            state.name = action.name;
            break;
    }
    return wt.extend(true,{},state);
};
