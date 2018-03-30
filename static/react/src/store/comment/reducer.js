/**
 * Created by Administrator on 2018/3/7.
 */
import {dispatch} from '../store';

let defaultState = {
    data:[],
    params:{}
};

export let commentData = (state = defaultState,action = {}) => {
    state = wt.clone(state);
    wt.execFunc(reducer[action.type],state,action);
    return state;
};

let reducer = {
    requestCommentEnd(state,action){
        state.isLoading = false;
        let {total,list} = action.data;
        state.data = list;
        state.total = total;
    },
    commentTurnPage(state,action){
        requestData(state,{
            num:action.num,
            size:action.size
        });
    }
};

const requestData = (state,newParams) => {
    requestDataByParams(wt.extend(state.params,newParams));
    state.isLoading = true;
};
const requestDataByParams = (params) => {
    $.ajax({
        url:'/getCommentList',
        data:params,
        success:(data) => {
            dispatch({
                type:'requestCommentEnd',
                data:data
            });
        }
    });
};