/**
 * Created by Administrator on 2018/3/7.
 */
import React,{Component} from 'react';
let defaultState = {
    list:[
        {
            name:'一班',
            id:1
        },
        {
            name:'二班',
            id:2
        },
        {
            name:'三班',
            id:3
        }
    ]
};
export let classData = (state = defaultState,action = {}) => {
    wt.execFunc(reducer[action.type],state,action);
    return state;
};


let reducer = {
    editClass(state,action){
        let {data} = action;
        let {list} = state;
        let {id,name} = data;
        let index = list.indexOfFunc((item) => item.id === id);
        if(index !== -1){
            list[index].name = name;
        }else{
            list.push({
                id,
                name
            });
        }
    }
};