/**
 * Created by Administrator on 2018/3/7.
 */
import {dispatch} from '../store';

let defaultState = {
    id:wt.getQueryString('bookId'),
    nav:[
        {
            title:'作品信息',
            path:'/intro'
        },
        {
            title:'目录',
            path:'/chapterList'
        },
        {
            title:'评论',
            path:'/comment'
        }
    ]
};

export let novelData = (state = defaultState,action = {}) => {
    let {execFunc,clone} = wt;
    state = clone(state);
    execFunc(reducer[action.type],state,action);
    return state;
};

let reducer = {
    requestInfo(state,action){
        $.ajax({
            url:'/book/getInfo',
            data:{
                bookId:state.id
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
        wt.extend(state,action.data);
    }
};


