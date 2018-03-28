/**
 * Created by Administrator on 2018/3/7.
 */
import {dispatch} from '../store';
let defaultState = {

};

export let chapterData = (state = defaultState,action = {}) => {
    let {execFunc,clone} = wt;
    state = clone(state);
    execFunc(reducer[action.type],state,action);
    return state;
};

let reducer = {
    requestInfo(state,action){
        $.ajax({
            url:'/book/chapter',
            data:{
                chapterId:wt.getQueryString('chapterId')
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
        state.data = action.data;
    }
};


