/**
 * Created by Administrator on 2018/3/7.
 */
import {dispatch} from '../store';
let defaultState = {
    data:[],
    menuList:[
        {
            iconCls:'icon-quanbu-copy',
            title:'全部',
            selected:true
        },
        {
            iconCls:'icon-bokeyuan',
            title:'博客',
            type:'blog'
        },
        {
            iconCls:'icon-shu1',
            title:'书籍',
            type:'book'
        }
    ],
    lbtData:[
        {
            src:'./img/1.jpg'
        },
        {
            src:'./img/2.jpg'
        },
        {
            src:'./img/3.jpg'
        },
        {
            src:'./img/4.jpg'
        }
    ]
};

export let homeData = (state = defaultState,action = {}) => {
    wt.execFunc(reducer[action.type],state,action);
    return wt.extend(true,{},state);
};

let reducer = {
    changeHomeNav(state,action){
        let {menuList} = state;
        let {index} = action;
        menuList.forEach((item,i) => {
            item.selected = i === index;
        });
        requestData({
            type:menuList[index].type
        });
        state.isLoading = true;
    },
    requestHomeDataEnd(state,action){
        state.isLoading = false;
        state.data = action.data;
    }
};


const requestData = (params) => {
    $.ajax({
        url:'/getHomeViewList',
        data:params,
        success:(data) => {
            dispatch({
                type:'requestHomeDataEnd',
                data:data
            });
        }
    });
};