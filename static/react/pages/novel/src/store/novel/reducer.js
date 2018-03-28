/**
 * Created by Administrator on 2018/3/7.
 */
import {dispatch} from '../store';
import Intro from '../../view/intro';
import ChapterList from '../../view/chapterList';
import Comment from '../../view/comment';
let defaultState = {
    nav:[
        {
            title:'作品信息',
            component:Intro
        },
        {
            title:'目录',
            component:ChapterList,
            selected:true
        },
        {
            title:'评论',
            component:Comment
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
    changeNav(state,action){
        let {nav} = state;
        let {index} = action;
        nav.forEach((item,i) => {
            item.loaded = item.loaded || item.selected || i === index;
            item.selected = i === index;
        });
    },
    requestInfo(state,action){
        $.ajax({
            url:'/book/getInfo',
            data:{
                bookId:wt.getQueryString('bookId')
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


