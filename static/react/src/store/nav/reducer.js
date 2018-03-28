/**
 * Created by Administrator on 2018/3/7.
 */
let defaultState = {
    list:[
        {
            title:'首页',
            path:'/home'
        },
        {
            title:'收藏',
            path:'/story'
        },
        {
            title:'博客',
            path:'/blog'
        }
    ]
};

export let navData = (state = defaultState,action = {}) => {
    state = wt.clone(state);
    wt.execFunc(reducer[action.type],state,action);
    return state;
}

const reducer = {

};