/**
 * Created by Administrator on 2018/3/7.
 */
import React,{Component} from 'react';
let defaultState = {
    list:[
        {
            id:1,
            name:'张三',
            subjectId:1
        },
        {
            id:2,
            name:'赵子',
            subjectId:3
        },
        {
            id:3,
            name:'李四',
            subjectId:5
        },
        {
            id:4,
            name:'王五',
            subjectId:6
        }
    ]
};
export let teacherData = (state = defaultState,action = {}) => {
    wt.execFunc(reducer[action.type],state,action);
    return state;
};

let reducer = {
    editTeacher(state,action){
        let {data} = action;
        let {list} = state;
        let {id,name,subjectId} = data;
        let index = list.indexOfFunc((item) => item.id === id);
        if(index !== -1){
            wt.extend(list[index],{
                name,
                subjectId
            });
        }else{
            list.push({
                id,
                name,
                subjectId
            });
        }
    }
};