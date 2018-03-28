/**
 * Created by Administrator on 2018/3/7.
 */
import {dispatch} from '../store';
let defaultState = {

};

export let blogData = (state = defaultState,action = {}) => {
    let {execFunc,clone} = wt;
    state = clone(state);
    execFunc(reducer[action.type],state,action);
    return state;
};

let reducer = {
    requestInfo(state,action){
        $.ajax({
            url:'/getBlogInfo',
            data:{
                blogId:wt.getQueryString('blogId')
            },
            success(data){
                dispatch({
                    type:'requestInfoEnd',
                    data:data
                });
            },
            error(err){
                dispatch({
                    type:'requestInfoEnd',
                    data:{}
                });
            }
        });
        state.isLoading = true;
    },
    requestInfoEnd(state,action){
        state.isLoading = false;
        let {data} = action;
        state.data = data;
        document.title = data.name;
    }
};


