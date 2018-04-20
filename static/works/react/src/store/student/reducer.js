/**
 * Created by Administrator on 2018/3/7.
 */
import React,{Component} from 'react';
let defaultState = {
    list:[
        {
            id:1,
            name:'风云'
        },
        {
            id:2,
            name:'林峰然'
        },
        {
            id:3,
            name:'吴严宽'
        }
    ]
};
export let studentData = (state = defaultState,action = {}) => {
    wt.execFunc(reducer[action.type],state,action);
    return state;
};

let reducer = {
    editStudent(state,action){
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