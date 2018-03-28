/**
 * Created by Administrator on 2018/3/7.
 */
import {dispatch} from '../store';
let defaultState = {
    data:[],
    params:{}
};

export let storyData = (state = defaultState,action = {}) => {
    wt.execFunc(reducer[action.type],state,action);
    return wt.extend(true,{},state);
};

let reducer = {
    requestStoryDataEnd(state,action){
        state.isLoading = false;
        let {total,list} = action.data;
        state.data = list;
        state.total = total;
    },
    storyTurnPage(state,action){
        requestData(state,{
            num:action.num,
            size:action.size
        });
    },
    searchStory(state,action){
        requestData(state,{
            keyword:action.keyword,
            num:1
        });
    }
};

const requestData = (state,newParams) => {
    requestDataByParams(wt.extend(state.params,newParams));
    state.isLoading = true;
};
const requestDataByParams = (params) => {
    $.ajax({
        url:'/getStoryList',
        data:params,
        success:(data) => {
            dispatch({
                type:'requestStoryDataEnd',
                data:data
            });
        }
    });
};